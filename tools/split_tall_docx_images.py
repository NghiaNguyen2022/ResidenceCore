from copy import deepcopy
from math import ceil
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "docs" / "HUONG_DAN_SU_DUNG_RESIDENCECORE_LUU_XA_NU_BMT_CHI_TIET_HOST.docx"
EMU_PER_INCH = 914400
MAX_PANEL_HEIGHT = 6.9


def first(node, xpath):
    items = node.xpath(xpath)
    return items[0] if items else None


def set_panel(draw, index, count, width_emu, original_height_emu):
    top = round(index * 100000 / count)
    bottom = round((count - index - 1) * 100000 / count)

    blip_fill = first(draw, ".//pic:blipFill")
    if blip_fill is not None:
        src_rect = first(blip_fill, "./a:srcRect")
        if src_rect is None:
            src_rect = OxmlElement("a:srcRect")
            blip = first(blip_fill, "./a:blip")
            if blip is not None:
                blip.addnext(src_rect)
            else:
                blip_fill.insert(0, src_rect)
        src_rect.set("t", str(top))
        src_rect.set("b", str(bottom))
        src_rect.set("l", "0")
        src_rect.set("r", "0")

    panel_height = round(original_height_emu / count)
    for extent in draw.xpath(".//wp:extent | .//a:xfrm/a:ext"):
        extent.set("cx", str(width_emu))
        extent.set("cy", str(panel_height))


doc = Document(PATH)
body = doc._element.body
split_count = 0
panel_count = 0

for paragraph in list(body.xpath("./w:p")):
    draw = first(paragraph, ".//w:drawing")
    extent = first(paragraph, ".//wp:extent")
    if draw is None or extent is None:
        continue
    width_emu = int(extent.get("cx"))
    height_emu = int(extent.get("cy"))
    height_in = height_emu / EMU_PER_INCH
    if height_in <= MAX_PANEL_HEIGHT:
        continue

    count = ceil(height_in / MAX_PANEL_HEIGHT)
    copies = [paragraph] + [deepcopy(paragraph) for _ in range(count - 1)]
    for index, panel_paragraph in enumerate(copies):
        panel_draw = first(panel_paragraph, ".//w:drawing")
        set_panel(panel_draw, index, count, width_emu, height_emu)
        if index > 0:
            paragraph.addnext(panel_paragraph)
            paragraph = panel_paragraph
    split_count += 1
    panel_count += count

doc.save(PATH)
print(f"split_images={split_count} panels={panel_count} output={PATH}")
