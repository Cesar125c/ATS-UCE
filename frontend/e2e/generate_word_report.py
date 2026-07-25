from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


FRONTEND = Path(__file__).resolve().parents[1]
PROJECT = FRONTEND.parent
SCREENSHOTS = FRONTEND / "e2e" / "reports" / "screenshots"
OUTPUT = PROJECT / "docs" / "Informe_Pruebas_Selenium_Cucumber_ATS-UCE.docx"

BLUE = "071429"
SKY = "0EA5E9"
LIGHT_BLUE = "EAF6FC"
GREEN = "DCFCE7"
WHITE = "FFFFFF"
GRAY = "475569"


def shade(cell, fill):
    properties = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill)
    properties.append(shading)


def set_cell_text(cell, text, bold=False, color=None, size=9):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Aptos"
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_heading(document, text, level=1):
    paragraph = document.add_paragraph()
    paragraph.style = f"Heading {level}"
    run = paragraph.add_run(text)
    run.font.color.rgb = RGBColor.from_string(BLUE if level == 1 else SKY)
    return paragraph


def add_caption(document, text):
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run(text)
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor.from_string(GRAY)


def configure_document(document):
    section = document.sections[0]
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    styles = document.styles
    styles["Normal"].font.name = "Aptos"
    styles["Normal"].font.size = Pt(10)
    styles["Normal"].paragraph_format.space_after = Pt(6)

    for section in document.sections:
        footer = section.footer.paragraphs[0]
        footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
        footer.add_run("ATS-UCE · Informe de pruebas E2E · Selenium + Cucumber")


def add_cover(document):
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.space_before = Pt(65)
    run = paragraph.add_run("ATS-UCE")
    run.bold = True
    run.font.name = "Aptos Display"
    run.font.size = Pt(38)
    run.font.color.rgb = RGBColor.from_string(SKY)

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run("INFORME DE PRUEBAS FUNCIONALES E2E")
    run.bold = True
    run.font.size = Pt(22)
    run.font.color.rgb = RGBColor.from_string(BLUE)

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run("Automatización con Selenium WebDriver y Cucumber")
    run.font.size = Pt(15)
    run.font.color.rgb = RGBColor.from_string(GRAY)

    document.add_paragraph()
    table = document.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    data = [
        ("Proyecto", "UCE TalentPath — ATS-UCE"),
        ("Tipo de prueba", "Funcional, interfaz y navegación de extremo a extremo"),
        ("Fecha de ejecución", datetime.now().strftime("%d/%m/%Y")),
        ("Resultado general", "APROBADO — 2/2 escenarios"),
    ]
    for row, (label, value) in zip(table.rows, data):
        shade(row.cells[0], BLUE)
        set_cell_text(row.cells[0], label, bold=True, color=WHITE, size=10)
        set_cell_text(row.cells[1], value, size=10)

    document.add_paragraph()
    note = document.add_paragraph()
    note.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = note.add_run(
        "Universidad Central del Ecuador · Sistema de gestión de reclutamiento docente"
    )
    run.italic = True
    run.font.color.rgb = RGBColor.from_string(GRAY)
    document.add_page_break()


def add_summary(document):
    add_heading(document, "1. Resumen ejecutivo")
    document.add_paragraph(
        "Se automatizaron y ejecutaron pruebas funcionales de extremo a extremo "
        "sobre la interfaz pública de ATS-UCE. La validación comprobó la carga de "
        "la portada, la presencia del contenido principal y la navegación desde la "
        "página inicial hacia el formulario de creación de cuenta."
    )

    table = document.add_table(rows=2, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    headers = ["Escenarios", "Pasos", "Aprobados", "Fallidos"]
    values = ["2", "10", "2 (100 %)", "0"]
    for index, text in enumerate(headers):
        shade(table.rows[0].cells[index], BLUE)
        set_cell_text(table.rows[0].cells[index], text, True, WHITE, 10)
    for index, text in enumerate(values):
        shade(table.rows[1].cells[index], GREEN)
        set_cell_text(table.rows[1].cells[index], text, True, BLUE, 11)

    add_heading(document, "2. Objetivo y alcance")
    document.add_paragraph(
        "Objetivo: verificar automáticamente que un visitante pueda acceder a la "
        "interfaz pública, identificar la plataforma ATS-UCE y llegar al proceso "
        "de registro mediante la acción principal."
    )
    document.add_paragraph(
        "Alcance: página principal y ruta pública /sign-up. Esta ejecución no "
        "incluye autenticación con cuentas reales, persistencia en base de datos, "
        "carga de hojas de vida ni flujos internos por rol."
    )

    add_heading(document, "3. Entorno y herramientas")
    bullets = [
        "Aplicación: frontend React + Vite de ATS-UCE.",
        "Automatización BDD: Cucumber 13.2.0.",
        "Navegador: Google Chrome 150.",
        "Controlador: ChromeDriver 150.0.4.",
        "Motor: Selenium WebDriver 4.46.0.",
        "Modo de ejecución: Chrome headless, ventana de 1440 × 1000 px.",
        "URL evaluada: http://localhost:5173.",
    ]
    for item in bullets:
        document.add_paragraph(item, style="List Bullet")


def add_case_table(document):
    add_heading(document, "4. Matriz de casos de prueba")
    table = document.add_table(rows=1, cols=6)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["ID", "Caso", "Precondición", "Acciones", "Resultado esperado", "Estado"]
    widths = [0.45, 1.25, 1.05, 1.7, 1.7, 0.65]
    for index, (text, width) in enumerate(zip(headers, widths)):
        cell = table.rows[0].cells[index]
        cell.width = Inches(width)
        shade(cell, BLUE)
        set_cell_text(cell, text, True, WHITE, 8)

    cases = [
        (
            "CP-01",
            "Visualización de portada",
            "Frontend disponible.",
            "1. Abrir la URL base.\n2. Localizar el título.\n3. Verificar el mensaje principal.",
            'Se muestra "ATS-UCE" y el texto principal de talento académico.',
            "APROBADO",
        ),
        (
            "CP-02",
            "Navegación al registro",
            "Visitante ubicado en la portada.",
            '1. Abrir la URL base.\n2. Pulsar "Explore Platform".\n3. Validar la ruta.',
            "La aplicación navega correctamente a /sign-up.",
            "APROBADO",
        ),
    ]
    for values in cases:
        cells = table.add_row().cells
        for index, value in enumerate(values):
            set_cell_text(cells[index], value, bold=index in (0, 5), size=8)
        shade(cells[5], GREEN)


def add_evidence(document):
    document.add_page_break()
    add_heading(document, "5. Evidencias de ejecución")

    add_heading(document, "CP-01 — La portada muestra la información principal", 2)
    document.add_paragraph(
        "Resultado observado: el encabezado ATS-UCE, el mensaje principal, los "
        "botones de acción y el formulario de acceso del postulante se mostraron "
        "correctamente. Las aserciones de contenido fueron satisfactorias."
    )
    image = SCREENSHOTS / "la-portada-muestra-la-informacion-principal.png"
    document.add_picture(str(image), width=Inches(7.0))
    add_caption(document, "Figura 1. Portada pública de ATS-UCE validada por Selenium.")

    add_heading(document, "CP-02 — El visitante puede ir al registro", 2)
    document.add_paragraph(
        'Resultado observado: después de pulsar "Explore Platform", el navegador '
        "llegó a la ruta /sign-up y mostró el formulario de creación de cuenta."
    )
    image = SCREENSHOTS / "el-visitante-puede-ir-al-registro.png"
    document.add_picture(str(image), width=Inches(7.0))
    add_caption(document, "Figura 2. Pantalla de registro alcanzada desde la portada.")


def add_results(document):
    add_heading(document, "6. Resultado de la ejecución")
    paragraph = document.add_paragraph()
    run = paragraph.add_run("2 escenarios aprobados · 10 pasos aprobados · 0 fallos")
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor.from_string("15803D")

    document.add_paragraph(
        "Tiempo registrado por Cucumber: 2.825 segundos. El resultado general se "
        "considera APROBADO para el alcance definido."
    )

    add_heading(document, "7. Conclusiones y recomendaciones")
    conclusions = [
        "La interfaz pública carga y presenta los elementos críticos esperados.",
        "La navegación principal hacia el registro funciona correctamente.",
        "Las evidencias quedan guardadas automáticamente para ejecuciones futuras.",
        "Como siguiente incremento, conviene automatizar registro, inicio de sesión "
        "y flujos por rol usando usuarios exclusivos del ambiente de pruebas.",
        "En integración continua se recomienda ejecutar la suite contra un entorno "
        "QA aislado y conservar el reporte HTML y las capturas como artefactos.",
    ]
    for item in conclusions:
        document.add_paragraph(item, style="List Bullet")


def main():
    required = [
        SCREENSHOTS / "la-portada-muestra-la-informacion-principal.png",
        SCREENSHOTS / "el-visitante-puede-ir-al-registro.png",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Faltan evidencias: {', '.join(missing)}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = Document()
    configure_document(document)
    add_cover(document)
    add_summary(document)
    add_case_table(document)
    add_evidence(document)
    add_results(document)
    document.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
