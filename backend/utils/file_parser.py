import logging
import io
from typing import Optional
import pdfplumber
from docx import Document

logger = logging.getLogger(__name__)

async def parse_uploaded_file(content: bytes, file_extension: str) -> Optional[str]:
    """
    Parse uploaded file content based on file extension
    """
    try:
        if file_extension == "txt":
            return parse_txt_file(content)
        elif file_extension == "pdf":
            return parse_pdf_file(content)
        elif file_extension == "docx":
            return parse_docx_file(content)
        else:
            raise ValueError(f"Unsupported file extension: {file_extension}")
            
    except Exception as e:
        logger.error(f"Error parsing file: {e}")
        raise

def parse_txt_file(content: bytes) -> str:
    """Parse text file"""
    try:
        # Try different encodings
        for encoding in ['utf-8', 'utf-16', 'latin-1', 'cp1252']:
            try:
                text = content.decode(encoding)
                return text.strip()
            except UnicodeDecodeError:
                continue
        
        # If all encodings fail, use utf-8 with error handling
        return content.decode('utf-8', errors='replace').strip()
        
    except Exception as e:
        logger.error(f"Error parsing TXT file: {e}")
        raise

def parse_pdf_file(content: bytes) -> str:
    """Parse PDF file using pdfplumber"""
    try:
        text_content = []
        
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text)
        
        if not text_content:
            raise ValueError("No text content found in PDF")
        
        return "\n".join(text_content).strip()
        
    except Exception as e:
        logger.error(f"Error parsing PDF file: {e}")
        raise

def parse_docx_file(content: bytes) -> str:
    """Parse DOCX file using python-docx"""
    try:
        doc = Document(io.BytesIO(content))
        text_content = []
        
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_content.append(paragraph.text.strip())
        
        if not text_content:
            raise ValueError("No text content found in DOCX")
        
        return "\n".join(text_content).strip()
        
    except Exception as e:
        logger.error(f"Error parsing DOCX file: {e}")
        raise

def validate_transcript_content(transcript: str) -> bool:
    """
    Validate that transcript content is suitable for processing
    """
    if not transcript or len(transcript.strip()) < 50:
        return False
    
    # Check for minimum word count
    words = transcript.split()
    if len(words) < 20:
        return False
    
    return True