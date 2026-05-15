from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import io

def build_pdf(sections: dict, name: str, email: str, phone: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)

    styles = getSampleStyleSheet()
    BLUE = colors.HexColor("#1D4ED8")
    DARK = colors.HexColor("#0f172a")
    MUTED = colors.HexColor("#64748b")

    name_style = ParagraphStyle("name", fontSize=22, fontName="Helvetica-Bold", textColor=DARK, alignment=TA_CENTER, spaceAfter=4)
    contact_style = ParagraphStyle("contact", fontSize=9, fontName="Helvetica", textColor=MUTED, alignment=TA_CENTER, spaceAfter=2)
    section_style = ParagraphStyle("section", fontSize=11, fontName="Helvetica-Bold", textColor=BLUE, spaceBefore=12, spaceAfter=4)
    body_style = ParagraphStyle("body", fontSize=9.5, fontName="Helvetica", textColor=DARK, leading=14, spaceAfter=3)

    story = []

    # Header
    story.append(Paragraph(name or "Your Name", name_style))
    contact_parts = [p for p in [email, phone] if p]
    story.append(Paragraph(" · ".join(contact_parts), contact_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BLUE, spaceAfter=8))

    section_order = ["summary", "skills", "experience", "projects", "education", "certifications"]
    section_labels = {
        "summary": "Professional Summary",
        "skills": "Technical Skills",
        "experience": "Work Experience",
        "projects": "Projects",
        "education": "Education",
        "certifications": "Certifications"
    }

    for key in section_order:
        content = sections.get(key, "").strip()
        if not content:
            continue
        story.append(Paragraph(section_labels[key], section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#bfdbfe"), spaceAfter=4))
        for line in content.split("\n"):
            line = line.strip()
            if not line:
                story.append(Spacer(1, 4))
                continue
            # Bullet points
            if line.startswith("-") or line.startswith("•"):
                line = "• " + line.lstrip("-•").strip()
            story.append(Paragraph(line, body_style))

    doc.build(story)
    return buffer.getvalue()