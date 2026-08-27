import fitz
from docx import Document
import io


def extract_pdf_text(file_bytes):
    text = ""

    pdf = fitz.open(stream=file_bytes, filetype="pdf")

    for page in pdf:
        text += page.get_text() + "\n"

    pdf.close()

    return text.strip()


def extract_docx_text(file_bytes):
    document = Document(io.BytesIO(file_bytes))

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n".join(paragraphs)


def extract_resume_text(file_bytes, filename):
    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(file_bytes)

    elif filename.endswith(".docx"):
        return extract_docx_text(file_bytes)

    else:
        raise ValueError("Only PDF and DOCX files are supported")