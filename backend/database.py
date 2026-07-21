"""
Database module for persistent conversation storage
"""
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ConversationDB:
    """SQLite database for storing conversation history"""

    def __init__(self, db_path: str = "data/conversations.db"):
        """Initialize database connection and create tables"""
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = None
        self.init_db()

    def get_connection(self):
        """Get database connection"""
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
        return self.conn

    def init_db(self):
        """Create database tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Sessions table - represents a chat session with one or more figures
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                title TEXT,
                metadata TEXT
            )
        ''')

        # Conversations table - represents dialogue with a specific figure within a session
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                figure_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
            )
        ''')

        # Messages table - individual messages in a conversation
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                citations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
            )
        ''')

        # Create indexes for faster queries
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id
            ON sessions(user_id)
        ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_conversations_session_id
            ON conversations(session_id)
        ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
            ON messages(conversation_id)
        ''')

        conn.commit()
        logger.info(f"Database initialized at {self.db_path}")

    def create_session(
        self,
        user_id: Optional[str] = None,
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO sessions (id, user_id, title, metadata)
            VALUES (?, ?, ?, ?)
        ''', (
            session_id,
            user_id,
            title or "New Conversation",
            json.dumps(metadata) if metadata else None
        ))

        conn.commit()
        logger.info(f"Created session {session_id}")
        return session_id

    def get_or_create_conversation(
        self,
        session_id: str,
        figure_id: str
    ) -> str:
        """Get existing conversation ID or create a new one"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Try to find existing conversation
        cursor.execute('''
            SELECT id FROM conversations
            WHERE session_id = ? AND figure_id = ?
        ''', (session_id, figure_id))

        result = cursor.fetchone()
        if result:
            return result['id']

        # Create new conversation
        conversation_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO conversations (id, session_id, figure_id)
            VALUES (?, ?, ?)
        ''', (conversation_id, session_id, figure_id))

        conn.commit()
        logger.info(f"Created conversation {conversation_id} for {figure_id} in session {session_id}")
        return conversation_id

    def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        citations: Optional[List[Dict[str, Any]]] = None
    ):
        """Save a message to the database"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO messages (conversation_id, role, content, citations)
            VALUES (?, ?, ?, ?)
        ''', (
            conversation_id,
            role,
            content,
            json.dumps(citations) if citations else None
        ))

        # Update conversation's updated_at timestamp
        cursor.execute('''
            UPDATE conversations
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (conversation_id,))

        # Update session's updated_at timestamp
        cursor.execute('''
            UPDATE sessions
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT session_id FROM conversations WHERE id = ?)
        ''', (conversation_id,))

        conn.commit()

    def get_conversation_history(
        self,
        conversation_id: str,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get conversation history (messages)"""
        conn = self.get_connection()
        cursor = conn.cursor()

        query = '''
            SELECT role, content, citations, created_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        '''

        if limit:
            query += f' LIMIT {limit}'

        cursor.execute(query, (conversation_id,))

        messages = []
        for row in cursor.fetchall():
            message = {
                'role': row['role'],
                'content': row['content'],
                'created_at': row['created_at']
            }

            if row['citations']:
                message['citations'] = json.loads(row['citations'])

            messages.append(message)

        return messages

    def get_session_conversations(
        self,
        session_id: str
    ) -> List[Dict[str, Any]]:
        """Get all conversations in a session"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT c.id, c.figure_id, c.created_at, c.updated_at,
                   COUNT(m.id) as message_count
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            WHERE c.session_id = ?
            GROUP BY c.id
            ORDER BY c.updated_at DESC
        ''', (session_id,))

        conversations = []
        for row in cursor.fetchall():
            conversations.append({
                'id': row['id'],
                'figure_id': row['figure_id'],
                'message_count': row['message_count'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            })

        return conversations

    def get_user_sessions(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get all sessions for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT s.id, s.title, s.created_at, s.updated_at, s.metadata,
                   COUNT(DISTINCT c.id) as conversation_count,
                   COUNT(m.id) as message_count
            FROM sessions s
            LEFT JOIN conversations c ON s.id = c.session_id
            LEFT JOIN messages m ON c.id = m.conversation_id
            WHERE s.user_id = ?
            GROUP BY s.id
            ORDER BY s.updated_at DESC
            LIMIT ?
        ''', (user_id, limit))

        sessions = []
        for row in cursor.fetchall():
            session = {
                'id': row['id'],
                'title': row['title'],
                'conversation_count': row['conversation_count'],
                'message_count': row['message_count'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }

            if row['metadata']:
                session['metadata'] = json.loads(row['metadata'])

            sessions.append(session)

        return sessions

    def update_session_title(
        self,
        session_id: str,
        title: str
    ):
        """Update session title"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            UPDATE sessions
            SET title = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (title, session_id))

        conn.commit()

    def delete_session(
        self,
        session_id: str
    ):
        """Delete a session and all associated conversations/messages"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute('DELETE FROM sessions WHERE id = ?', (session_id,))
        conn.commit()
        logger.info(f"Deleted session {session_id}")

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None


# Global database instance
conversation_db = ConversationDB()
