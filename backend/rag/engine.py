"""
RAG Engine - Core retrieval and generation logic
"""
from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from openai import OpenAI
import logging
import sys
import os

# Import settings - try both import paths
try:
    from backend.config import settings
except ImportError:
    from config import settings

logger = logging.getLogger(__name__)


class RAGEngine:
    """Handles retrieval and generation for historical figures"""
    
    def __init__(self):
        """Initialize the RAG engine with vector DB and embeddings"""
        self.embeddings = self._init_embeddings()
        self.vector_db = self._init_vector_db()
        self.llm_client = OpenAI(api_key=settings.openai_api_key)
        
    def _init_embeddings(self):
        """Initialize embedding model"""
        if settings.embedding_provider == "openai":
            return OpenAIEmbeddings(
                model=settings.embedding_model,
                openai_api_key=settings.openai_api_key
            )
        else:
            raise ValueError(f"Unsupported embedding provider: {settings.embedding_provider}")
    
    def _init_vector_db(self):
        """Initialize vector database"""
        if settings.vector_db_type == "chromadb":
            client = chromadb.PersistentClient(
                path=settings.chroma_persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            return client
        else:
            raise ValueError(f"Unsupported vector DB: {settings.vector_db_type}")
    
    def get_or_create_collection(self, figure_id: str):
        """Get or create a collection for a historical figure"""
        collection_name = f"figure_{figure_id}"
        try:
            return self.vector_db.get_collection(name=collection_name)
        except Exception:
            return self.vector_db.create_collection(
                name=collection_name,
                metadata={"figure_id": figure_id}
            )
    
    def retrieve_context(
        self,
        figure_id: str,
        query: str,
        k: int = None
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant context chunks for a query"""
        k = k or settings.retrieval_k
        
        try:
            collection = self.get_or_create_collection(figure_id)
            
            # Embed the query
            query_embedding = self.embeddings.embed_query(query)
            
            # Search for similar chunks
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            chunks = []
            if results["documents"] and results["documents"][0]:
                for doc, metadata, distance in zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0]
                ):
                    chunks.append({
                        "content": doc,
                        "metadata": metadata,
                        "relevance_score": 1 - distance  # Convert distance to similarity
                    })
            
            logger.info(f"Retrieved {len(chunks)} chunks for figure {figure_id}")
            return chunks
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []
    
    def generate_response(
        self,
        figure_id: str,
        query: str,
        context_chunks: List[Dict[str, Any]],
        system_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Generate a response using retrieved context"""
        
        # Format context
        context_text = "\n\n".join([
            f"[Source: {chunk['metadata'].get('source', 'Unknown')}]\n{chunk['content']}"
            for chunk in context_chunks
        ])
        
        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Last 10 messages
        
        # Add context and current query
        user_message = f"""Based on the following source material about this historical figure:

{context_text}

Please respond to: {query}

Remember to:
1. Stay true to the historical figure's documented views and personality
2. Reference specific sources when relevant
3. If the question goes beyond your documented knowledge, acknowledge that thoughtfully
"""
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            # Generate response
            response = self.llm_client.chat.completions.create(
                model=settings.default_model,
                messages=messages,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens
            )
            
            response_text = response.choices[0].message.content
            
            # Extract citations if enabled
            citations = []
            if settings.enable_citations:
                for chunk in context_chunks[:3]:  # Top 3 most relevant
                    citations.append({
                        "source": chunk["metadata"].get("source", "Unknown"),
                        "excerpt": chunk["content"][:200] + "...",
                        "relevance_score": chunk["relevance_score"]
                    })
            
            return {
                "response": response_text,
                "citations": citations if citations else None,
                "context_chunks": [chunk["content"] for chunk in context_chunks]
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise
    
    def ingest_documents(
        self,
        figure_id: str,
        documents: List[str],
        metadatas: List[Dict[str, Any]]
    ) -> int:
        """Ingest documents into the vector database"""
        
        # Initialize text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        # Split documents into chunks
        all_chunks = []
        all_metadatas = []
        
        for doc, metadata in zip(documents, metadatas):
            chunks = text_splitter.split_text(doc)
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                chunk_metadata = metadata.copy()
                chunk_metadata["chunk_index"] = i
                all_metadatas.append(chunk_metadata)
        
        # Get collection
        collection = self.get_or_create_collection(figure_id)
        
        # Generate embeddings and add to collection
        embeddings = [self.embeddings.embed_query(chunk) for chunk in all_chunks]
        
        # Generate IDs
        ids = [f"{figure_id}_{i}" for i in range(len(all_chunks))]
        
        # Add to collection
        collection.add(
            embeddings=embeddings,
            documents=all_chunks,
            metadatas=all_metadatas,
            ids=ids
        )
        
        logger.info(f"Ingested {len(all_chunks)} chunks for figure {figure_id}")
        return len(all_chunks)
    
    def get_figure_stats(self, figure_id: str) -> Dict[str, Any]:
        """Get statistics about a figure's knowledge base"""
        try:
            collection = self.get_or_create_collection(figure_id)
            count = collection.count()
            
            return {
                "figure_id": figure_id,
                "chunk_count": count,
                "available": count > 0
            }
        except Exception as e:
            logger.error(f"Error getting stats for {figure_id}: {e}")
            return {
                "figure_id": figure_id,
                "chunk_count": 0,
                "available": False
            }


# Global RAG engine instance
rag_engine = RAGEngine()
