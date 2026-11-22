import fs from 'node:fs';
import path from 'node:path';

const dataPath = path.resolve(process.cwd(), 'public/data/profiles.json');
const outDir = path.resolve(process.cwd(), 'public/assets/cv');

fs.mkdirSync(outDir, { recursive: true });
const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function escapePdfText(str) {
  return String(str)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text, maxChars = 84) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function buildPdfBuffer(member, group) {
  const lines = [];
  const addHeading = (title) => {
    lines.push({ type: 'spacer', size: 8 });
    lines.push({ type: 'section', text: title.toUpperCase() });
    lines.push({ type: 'rule' });
  };

  lines.push({ type: 'title', text: member.name });
  lines.push({ type: 'subtitle', text: `${member.designation} | ${member.department}` });
  lines.push({ type: 'subtitle', text: `${member.institution} — ${group.name}` });
  lines.push({
    type: 'meta',
    text: `Email: ${member.contact.email}${member.contact.phone ? `  |  Phone: ${member.contact.phone}` : ''}`,
  });
  if (member.contact.address) {
    lines.push({ type: 'meta', text: `Address: ${member.contact.address}` });
  }

  addHeading('Profile & Research Interests');
  for (const l of wrapText(member.fullBio, 88)) {
    lines.push({ type: 'body', text: l });
  }
  lines.push({ type: 'spacer', size: 4 });
  lines.push({
    type: 'bodyBold',
    text: `Research Interests: ${member.researchInterests.join('  |  ')}`,
  });

  addHeading('Academic Qualifications');
  for (const q of member.qualifications) {
    lines.push({ type: 'bodyBold', text: `${q.degree} (${q.year}) — ${q.institution}` });
    lines.push({
      type: 'body',
      text: `Specialization: ${q.specialization}${q.achievements ? ` | ${q.achievements}` : ''}`,
    });
  }

  addHeading('Selected Research Projects');
  for (const p of member.researchProjects) {
    lines.push({ type: 'bodyBold', text: `${p.title} [${p.status}, ${p.timeframe}]` });
    for (const l of wrapText(`${p.role}: ${p.description}`, 88)) {
      lines.push({ type: 'body', text: l });
    }
  }

  addHeading('Selected Publications');
  for (const pub of member.publications) {
    const citation = `[${pub.year}] ${pub.authors} "${pub.title}." ${pub.venue}.${pub.doi ? ` DOI: ${pub.doi}` : ''}`;
    for (const l of wrapText(citation, 88)) {
      lines.push({ type: 'body', text: l });
    }
  }

  addHeading('Academic Experience');
  const expGroups = [
    ['Teaching', member.experience.teaching],
    ['Research', member.experience.research],
    ['Workshops & Training', [...member.experience.workshops, ...member.experience.certifications]],
  ];
  for (const [label, items] of expGroups) {
    for (const item of items) {
      lines.push({
        type: 'bodyBold',
        text: `${label}: ${item.role} (${item.period}) — ${item.organization}`,
      });
    }
  }

  addHeading('Technical & Research Skills');
  const skillRows = [
    ['Technical', member.skills.technical],
    ['Tools & Software', member.skills.researchTools],
    ['Programming', member.skills.programming],
    ['GIS / Remote Sensing', member.skills.gisRemoteSensing],
  ];
  for (const [label, arr] of skillRows) {
    if (arr && arr.length) {
      for (const l of wrapText(`${label}: ${arr.join(', ')}`, 88)) {
        lines.push({ type: 'body', text: l });
      }
    }
  }

  // Paginate lines across Letter pages (612 x 792)
  const pages = [];
  let streamOps = [];
  let y = 742;

  const flushPage = () => {
    pages.push(streamOps.join('\n'));
    streamOps = [];
    y = 742;
  };

  const ensureSpace = (needed) => {
    if (y - needed < 54) {
      flushPage();
    }
  };

  for (const item of lines) {
    if (item.type === 'spacer') {
      y -= item.size;
      continue;
    }
    if (item.type === 'rule') {
      ensureSpace(10);
      streamOps.push(`0.75 w 0.82 0.84 0.88 RG 54 ${y + 3} m 558 ${y + 3} l S`);
      y -= 8;
      continue;
    }

    let font = '/F1';
    let size = 9.5;
    let leading = 13;
    let color = '0.12 0.14 0.18 rg';

    if (item.type === 'title') {
      font = '/F2';
      size = 18;
      leading = 22;
      color = '0.07 0.12 0.25 rg';
    } else if (item.type === 'subtitle') {
      font = '/F1';
      size = 10.5;
      leading = 14;
      color = '0.25 0.29 0.36 rg';
    } else if (item.type === 'meta') {
      font = '/F1';
      size = 8.8;
      leading = 12;
      color = '0.35 0.38 0.44 rg';
    } else if (item.type === 'section') {
      font = '/F2';
      size = 10.5;
      leading = 14;
      color = '0.12 0.23 0.54 rg';
    } else if (item.type === 'bodyBold') {
      font = '/F2';
      size = 9.3;
      leading = 13;
      color = '0.10 0.12 0.16 rg';
    }

    ensureSpace(leading + 2);
    streamOps.push(
      `BT ${font} ${size} Tf ${color} 1 0 0 1 54 ${y} Tm (${escapePdfText(item.text)}) Tj ET`
    );
    y -= leading;
  }

  if (streamOps.length > 0) {
    pages.push(streamOps.join('\n'));
  }

  // Assemble PDF objects
  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontRegularId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds = [];
  const pagesPlaceholderId = addObj(''); // filled later

  for (const content of pages) {
    const contentId = addObj(
      `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`
    );
    const pageId = addObj(
      `<< /Type /Page /Parent ${pagesPlaceholderId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[pagesPlaceholderId - 1] = `<< /Type /Pages /Kids [${pageIds
    .map((id) => `${id} 0 R`)
    .join(' ')}] /Count ${pageIds.length} >>`;

  const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesPlaceholderId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

raw.members.forEach((member, idx) => {
  const filename = path.basename(member.cvUrl || `person${idx + 1}-cv.pdf`);
  const target = path.join(outDir, filename);
  const buffer = buildPdfBuffer(member, raw.group);
  fs.writeFileSync(target, buffer);
  console.log(`Generated ${target} (${buffer.length} bytes)`);
});
