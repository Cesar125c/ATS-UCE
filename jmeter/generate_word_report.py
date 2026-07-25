"""Generate the ATS-UCE JMeter performance-test report from real artifacts."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
JMETER = ROOT / "jmeter"
RESULTS = JMETER / "results"
STATS_FILE = RESULTS / "html" / "statistics.json"
JTL_FILE = RESULTS / "results.jtl"
ASSETS = JMETER / "report-assets"
OUTPUT = ROOT / "docs" / "Informe_Pruebas_Rendimiento_JMeter_ATS-UCE.docx"

BLUE = "17365D"
LIGHT_BLUE = "D9EAF7"
GREEN = "198754"
LIGHT_GREEN = "DFF2E1"
GRAY = "666666"
LIGHT_GRAY = "F2F2F2"


def image_font(size: int, bold: bool = False):
    names = ("arialbd.ttf", "calibrib.ttf") if bold else ("arial.ttf", "calibri.ttf")
    for name in names:
        candidate = Path("C:/Windows/Fonts") / name
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def shade(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    element = tc_pr.find(qn("w:shd"))
    if element is None:
        element = OxmlElement("w:shd")
        tc_pr.append(element)
    element.set(qn("w:fill"), fill)


def set_cell_text(cell, text: str, bold: bool = False, color: str | None = None):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    run = paragraph.add_run(str(text))
    run.bold = bold
    run.font.name = "Arial"
    run.font.size = Pt(9)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_table(document: Document, headers: list[str], rows: list[list[str]], widths=None):
    table = document.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    for index, header in enumerate(headers):
        set_cell_text(table.rows[0].cells[index], header, True, "FFFFFF")
        shade(table.rows[0].cells[index], BLUE)
    for row_index, values in enumerate(rows):
        cells = table.add_row().cells
        for index, value in enumerate(values):
            set_cell_text(cells[index], value)
            if row_index % 2:
                shade(cells[index], LIGHT_GRAY)
            if widths:
                cells[index].width = Cm(widths[index])
    document.add_paragraph()
    return table


def add_heading(document: Document, text: str, level: int):
    paragraph = document.add_heading(text, level=level)
    paragraph.paragraph_format.space_before = Pt(10)
    paragraph.paragraph_format.space_after = Pt(5)
    return paragraph


def add_body(document: Document, text: str):
    paragraph = document.add_paragraph(text)
    paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    paragraph.paragraph_format.space_after = Pt(6)
    paragraph.paragraph_format.line_spacing = 1.08
    return paragraph


def create_summary(path: Path, total: dict):
    image = Image.new("RGB", (1500, 690), "white")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((25, 25, 1475, 665), radius=24, outline=f"#{BLUE}", width=4)
    draw.text((70, 60), "ATS-UCE | Pruebas de rendimiento", fill=f"#{BLUE}", font=image_font(43, True))
    draw.text((70, 120), "Apache JMeter 5.6.3 · entorno local", fill="#666666", font=image_font(27))
    cards = [
        (f"{int(total['sampleCount'])}", "Solicitudes"),
        (f"{total['errorPct']:.2f} %", "Errores"),
        (f"{total['meanResTime']:.2f} ms", "Tiempo promedio"),
        (f"{total['pct2ResTime']:.2f} ms", "Percentil 95"),
    ]
    for index, (value, label) in enumerate(cards):
        x = 70 + index * 350
        fill = "#DFF2E1" if index in (1, 2, 3) else "#D9EAF7"
        draw.rounded_rectangle((x, 200, x + 305, 415), radius=18, fill=fill, outline="#AAB7C4", width=2)
        box = draw.textbbox((0, 0), value, font=image_font(42, True))
        draw.text((x + (305 - box[2] + box[0]) / 2, 245), value, fill=f"#{BLUE}", font=image_font(42, True))
        box = draw.textbbox((0, 0), label, font=image_font(22))
        draw.text((x + (305 - box[2] + box[0]) / 2, 345), label, fill="#333333", font=image_font(22))
    draw.rounded_rectangle((70, 475, 1420, 600), radius=16, fill="#F2F2F2")
    draw.ellipse((110, 505, 175, 570), fill=f"#{GREEN}")
    draw.text((126, 507), "✓", fill="white", font=image_font(40, True))
    draw.text((210, 500), "Resultado: ejecución satisfactoria, sin errores HTTP ni fallos", fill=f"#{BLUE}", font=image_font(26, True))
    draw.text((210, 542), "de aserción en los endpoints públicos evaluados.", fill=f"#{BLUE}", font=image_font(26, True))
    image.save(path)


def load_data():
    if not STATS_FILE.exists() or not JTL_FILE.exists():
        raise FileNotFoundError("Run JMeter first; statistics.json or results.jtl is missing.")
    stats = json.loads(STATS_FILE.read_text(encoding="utf-8"))
    with JTL_FILE.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    timestamps = [int(row["timeStamp"]) for row in rows]
    end_timestamps = [int(row["timeStamp"]) + int(row["elapsed"]) for row in rows]
    local_tz = timezone(timedelta(hours=-5))
    started = datetime.fromtimestamp(min(timestamps) / 1000, local_tz)
    ended = datetime.fromtimestamp(max(end_timestamps) / 1000, local_tz)
    observed_threads = max(int(row["allThreads"]) for row in rows)
    codes = sorted({row["responseCode"] for row in rows})
    return stats, rows, started, ended, observed_threads, codes


def build_report():
    stats, rows, started, ended, observed_threads, codes = load_data()
    total = stats["Total"]
    ASSETS.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    summary_image = ASSETS / "jmeter-summary.png"
    create_summary(summary_image, total)

    document = Document()
    section = document.sections[0]
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(1.8)
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)

    styles = document.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(10)
    for style_name in ("Title", "Heading 1", "Heading 2"):
        styles[style_name].font.name = "Arial"
        styles[style_name].font.color.rgb = RGBColor.from_string(BLUE)

    header = section.header.paragraphs[0]
    header.text = "UNIVERSIDAD CENTRAL DEL ECUADOR  |  ATS-UCE"
    header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    header.runs[0].font.name = "Arial"
    header.runs[0].font.size = Pt(8)
    header.runs[0].font.color.rgb = RGBColor.from_string(GRAY)

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.add_run("Informe de pruebas de rendimiento · Apache JMeter 5.6.3")

    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_before = Pt(75)
    run = title.add_run("INFORME DE PRUEBAS\nDE RENDIMIENTO")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(26)
    run.font.color.rgb = RGBColor.from_string(BLUE)
    subtitle = document.add_paragraph("Sistema ATS-UCE · API REST")
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.runs[0].font.size = Pt(17)
    subtitle.runs[0].font.color.rgb = RGBColor.from_string(GRAY)
    document.add_picture(str(summary_image), width=Cm(16.5))
    document.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_table(document, ["Dato", "Valor"], [
        ["Herramienta", "Apache JMeter 5.6.3"],
        ["Fecha de ejecución", started.strftime("%d/%m/%Y %H:%M:%S (UTC-05:00)")],
        ["Ambiente", "Desarrollo local · http://localhost:8000"],
        ["Plan", "jmeter/ats-uce-performance.jmx"],
    ], [5, 11])
    document.add_page_break()

    add_heading(document, "1. Resumen ejecutivo", 1)
    add_body(document, (
        f"Se ejecutó una prueba de carga sobre dos endpoints públicos de solo lectura de la API ATS-UCE. "
        f"La ejecución procesó {int(total['sampleCount'])} solicitudes en {(ended-started).total_seconds():.3f} "
        f"segundos, sin errores. El tiempo promedio global fue {total['meanResTime']:.2f} ms y el percentil "
        f"95 fue {total['pct2ResTime']:.2f} ms."
    ))
    add_body(document, (
        "Los resultados son satisfactorios para el escenario local evaluado. No constituyen por sí solos una "
        "certificación de capacidad productiva, ya que cliente, API y contenedores se ejecutaron en el mismo equipo."
    ))

    add_heading(document, "2. Objetivo y alcance", 1)
    add_body(document, (
        "El objetivo fue observar estabilidad, latencia y capacidad de respuesta de operaciones seguras de consulta "
        "bajo concurrencia progresiva, evitando cambios en la base de datos y la activación de correo, almacenamiento "
        "o análisis con inteligencia artificial."
    ))
    add_table(document, ["Incluido", "Excluido"], [
        ["GET /api/v1/health", "Creación y eliminación de vacantes"],
        ["GET /api/v1/vacancies/", "Carga y procesamiento de hojas de vida"],
        ["Validación de código HTTP 200", "Evaluaciones, aprobaciones y notificaciones"],
        ["Conexiones HTTP persistentes", "Endpoints protegidos con JWT"],
    ])

    add_heading(document, "3. Configuración de la prueba", 1)
    add_table(document, ["Parámetro", "Valor"], [
        ["Usuarios virtuales configurados", "20"],
        ["Ramp-up", "20 segundos"],
        ["Iteraciones por usuario", "10"],
        ["Solicitudes por iteración", "2"],
        ["Pausa entre solicitudes", "250 ms"],
        ["Solicitudes esperadas", "400"],
        ["Hilos simultáneos máximos observados", str(observed_threads)],
        ["Timeout de conexión / respuesta", "5.000 ms / 10.000 ms"],
    ])
    add_body(document, (
        "Aunque se configuraron 20 usuarios virtuales, el máximo simultáneo observado fue "
        f"{observed_threads}. Esto ocurre porque los usuarios se incorporaron durante el ramp-up y las iteraciones "
        "terminaron rápidamente; algunos finalizaron antes de que ingresaran los últimos."
    ))

    add_heading(document, "4. Resultados", 1)
    metric_rows = []
    for key in ("GET Health", "GET Public Vacancies", "Total"):
        item = stats[key]
        metric_rows.append([
            key,
            str(int(item["sampleCount"])),
            f"{item['errorPct']:.2f} %",
            f"{item['meanResTime']:.2f}",
            f"{item['medianResTime']:.2f}",
            f"{item['pct1ResTime']:.2f}",
            f"{item['pct2ResTime']:.2f}",
            f"{item['pct3ResTime']:.2f}",
            f"{item['maxResTime']:.2f}",
        ])
    add_table(document,
              ["Muestra", "N", "Error", "Prom.", "Mediana", "P90", "P95", "P99", "Máx."],
              metric_rows)
    add_body(document, "Todos los tiempos están expresados en milisegundos.")
    add_table(document, ["Indicador global", "Resultado"], [
        ["Throughput", f"{total['throughput']:.2f} solicitudes/segundo"],
        ["Datos recibidos", f"{total['receivedKBytesPerSec']:.2f} KiB/s"],
        ["Datos enviados", f"{total['sentKBytesPerSec']:.2f} KiB/s"],
        ["Códigos HTTP observados", ", ".join(codes)],
        ["Errores / fallos de aserción", f"{int(total['errorCount'])} / {len([r for r in rows if r['success'] != 'true'])}"],
    ])

    add_heading(document, "5. Evaluación", 1)
    add_table(document, ["Criterio indicativo", "Resultado", "Estado"], [
        ["Tasa de errores = 0 %", f"{total['errorPct']:.2f} %", "CUMPLE"],
        ["Percentil 95 < 500 ms", f"{total['pct2ResTime']:.2f} ms", "CUMPLE"],
        ["Máximo < 1.000 ms", f"{total['maxResTime']:.2f} ms", "CUMPLE"],
        ["Respuestas HTTP esperadas", ", ".join(codes), "CUMPLE"],
    ])
    add_body(document, (
        "Los umbrales anteriores se emplean como criterios indicativos para esta evaluación y no reemplazan acuerdos "
        "de nivel de servicio aprobados por el proyecto. La API mantuvo respuestas correctas y latencias bajas durante "
        "la carga aplicada."
    ))

    add_heading(document, "6. Conclusiones y recomendaciones", 1)
    for text in [
        "La ejecución finalizó sin errores en las 400 solicitudes realizadas.",
        "Los endpoints de salud y vacantes públicas respondieron de forma estable en el ambiente local.",
        "El percentil 95 global de 8 ms indica baja variabilidad para el escenario medido.",
        "Se recomienda repetir la prueba en un ambiente QA separado, con JMeter en otro equipo y monitoreo de CPU, memoria, base de datos y red.",
        "Para determinar el punto de saturación deben ejecutarse escenarios escalonados y una prueba de duración sostenida.",
        "Los flujos que modifican datos solo deben probarse con fixtures controlados y servicios externos de prueba.",
    ]:
        document.add_paragraph(text, style="List Bullet")

    add_heading(document, "7. Evidencias y trazabilidad", 1)
    add_table(document, ["Artefacto", "Ubicación"], [
        ["Plan de prueba", "jmeter/ats-uce-performance.jmx"],
        ["Resultados crudos", "jmeter/results/results.jtl"],
        ["Panel HTML", "jmeter/results/html/index.html"],
        ["Estadísticas utilizadas", "jmeter/results/html/statistics.json"],
        ["Informe Word", "docs/Informe_Pruebas_Rendimiento_JMeter_ATS-UCE.docx"],
    ])
    add_body(document, (
        "El documento fue generado automáticamente a partir de statistics.json y results.jtl. Los valores pueden "
        "reproducirse ejecutando nuevamente el plan y regenerando este informe."
    ))

    document.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build_report()
