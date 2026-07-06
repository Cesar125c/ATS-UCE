# PDF Text Extraction Design — ATS-UCE

## 1. Overview
Extracts text from PDF CVs for AI scoring using PyMuPDF (fitz). Handles unreadable PDFs with rejection workflows and email notifications.

## 2. Flow

### Happy Path
1. Update status: `PROCESSING_AI` + `status_history`
2. Download PDF from Backblaze B2
3. Extract text with PyMuPDF
4. Analyze text with OpenAI
5. Update status: `HR_STAGE`/`REJECTED`

### Unreadable PDF
1. Update status: `PROCESSING_AI` + `status_history`
2. Download PDF from Backblaze B2
3. Extract text with PyMuPDF → empty/whitespace
4. Update status: `REJECTED` + `status_history`
5. Send email notification to candidate

## 3. Error Handling

| Error | Handling | Status Change | Notification |
|-------|----------|---------------|--------------|
| B2 download failure | Log error | None | None |
| PyMuPDF failure | Reject PDF | `REJECTED` | Email to candidate |
| Empty text | Reject PDF | `REJECTED` | Email to candidate |

## 4. Implementation Details

### PyMuPDF Usage
```python
import fitz

def extract_text(pdf_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text
```

### Memory Management
- PDF bytes and extracted text **never persisted** to database
- Text only lives in memory during AI analysis
- PDF streams properly closed after extraction

## 5. Status Transitions

| From | To | Trigger |
|------|----|---------|
| Any | `PROCESSING_AI` | Start processing |
| `PROCESSING_AI` | `REJECTED` | Unreadable PDF |
| `PROCESSING_AI` | `HR_STAGE`/`REJECTED` | AI scoring complete |
