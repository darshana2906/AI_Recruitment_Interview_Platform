import os
import docx

RESUME_DIR = os.path.join(os.path.dirname(__file__), "resumes")
os.makedirs(RESUME_DIR, exist_ok=True)

def create_docx(filename, name, email, phone, location, title, summary, skills, experience, education, projects):
    filepath = os.path.join(RESUME_DIR, filename)
    doc = docx.Document()
    
    # Heading
    doc.add_heading(name, 0)
    p = doc.add_paragraph(f"{email} | {phone} | {location}")
    p.runs[0].font.size = docx.shared.Pt(10)
    
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph(summary)
    
    doc.add_heading("Technical Skills", level=1)
    doc.add_paragraph(", ".join(skills))
    
    doc.add_heading("Work Experience", level=1)
    for exp in experience:
        p = doc.add_paragraph()
        p.add_run(f"{exp['title']} - {exp['company']}").bold = True
        p.add_run(f" ({exp['duration']})\n")
        p.add_run(exp['desc'])
        
    doc.add_heading("Education", level=1)
    for edu in education:
        p = doc.add_paragraph()
        p.add_run(f"{edu['degree']} - {edu['institution']} ({edu['year']})")
        
    doc.add_heading("Projects", level=1)
    for proj in projects:
        p = doc.add_paragraph()
        p.add_run(f"{proj['name']} (Tech: {', '.join(proj['tech'])})\n").bold = True
        p.add_run(proj['desc'])
        
    doc.save(filepath)
    print(f"Created DOCX: {filepath}")

# Helper to create a clean PDF file using raw PDF syntax
def create_pdf(filename, text_lines):
    filepath = os.path.join(RESUME_DIR, filename)
    # Minimal valid PDF-1.4 format
    content_stream = "BT /F1 10 Tf 50 750 Td 15 TL\n"
    for line in text_lines:
        safe_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        content_stream += f"({safe_line}) '\n"
    content_stream += "ET"
    
    stream_len = len(content_stream.encode('latin-1'))
    
    pdf = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length {stream_len} >>
stream
{content_stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
380
%%EOF"""
    
    with open(filepath, "wb") as f:
        f.write(pdf.encode('latin-1'))
    print(f"Created PDF: {filepath}")

# 1. Alex Turner - Full Stack Senior (DOCX)
create_docx(
    filename="alex_turner_fullstack.docx",
    name="Alex Turner",
    email="alex.turner@example.com",
    phone="+1 (555) 234-5678",
    location="San Francisco, CA",
    title="Senior Full-Stack Engineer",
    summary="Results-oriented Senior Full-Stack Engineer with 6.5 years of experience building high-scale web platforms using React, Node.js, TypeScript, Python, and cloud microservices.",
    skills=["React", "TypeScript", "Node.js", "Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "REST APIs", "AWS", "Redis"],
    experience=[
        {
            "company": "CloudPeak Technologies",
            "title": "Lead Software Engineer",
            "duration": "2021 - Present (3.5 years)",
            "desc": "Architected distributed RESTful services handling 10M daily transactions. Mentored junior engineers."
        },
        {
            "company": "NextGen Web Systems",
            "title": "Full-Stack Developer",
            "duration": "2018 - 2021 (3.0 years)",
            "desc": "Developed interactive customer-facing interfaces in React and backend services in Node.js and SQL."
        }
    ],
    education=[
        {
            "degree": "Bachelor of Science in Computer Science",
            "institution": "University of California, Berkeley",
            "year": "2018"
        }
    ],
    projects=[
        {
            "name": "Distributed Analytics Engine",
            "tech": ["React", "FastAPI", "PostgreSQL", "Docker"],
            "desc": "Real-time dashboard processing high-throughput telemetry data."
        }
    ]
)

# 2. David Kim - DevOps / Backend (DOCX)
create_docx(
    filename="david_kim_devops.docx",
    name="David Kim",
    email="david.kim@example.com",
    phone="+1 (555) 876-5432",
    location="Seattle, WA",
    title="Cloud DevOps & Platform Engineer",
    summary="Platform and Infrastructure Engineer with 5.0 years of experience in Docker, Kubernetes, CI/CD pipelines, Python, and cloud infrastructure.",
    skills=["Docker", "Kubernetes", "AWS", "Python", "CI/CD", "Linux", "Terraform", "PostgreSQL", "REST APIs"],
    experience=[
        {
            "company": "InnoCloud Systems",
            "title": "Senior Infrastructure Engineer",
            "duration": "2022 - Present (2.5 years)",
            "desc": "Managed multi-region Kubernetes clusters on AWS and automated CI/CD pipelines."
        },
        {
            "company": "DataStream Solutions",
            "title": "Systems Engineer",
            "duration": "2019 - 2022 (2.5 years)",
            "desc": "Maintained cloud environments and automated deployment tooling using Python."
        }
    ],
    education=[
        {
            "degree": "Bachelor of Science in Information Technology",
            "institution": "University of Washington",
            "year": "2019"
        }
    ],
    projects=[
        {
            "name": "Automated Deployment Pipeline",
            "tech": ["Docker", "Kubernetes", "GitHub Actions"],
            "desc": "Zero-downtime deployment pipeline for containerized services."
        }
    ]
)

# 3. James Wilson - Junior Developer (DOCX)
create_docx(
    filename="james_wilson_junior.docx",
    name="James Wilson",
    email="james.wilson@example.com",
    phone="+1 (555) 345-6789",
    location="Austin, TX",
    title="Junior Software Developer",
    summary="Enthusiastic Junior Developer with 1.2 years of experience in JavaScript, React, HTML, CSS, and Python backend fundamentals.",
    skills=["JavaScript", "React", "HTML", "CSS", "Python", "Git", "SQL"],
    experience=[
        {
            "company": "BrightStar Tech",
            "title": "Junior Web Developer",
            "duration": "2023 - Present (1.2 years)",
            "desc": "Built responsive React components and assisted in REST API integration."
        }
    ],
    education=[
        {
            "degree": "Bachelor of Science in Software Engineering",
            "institution": "University of Texas at Austin",
            "year": "2023"
        }
    ],
    projects=[
        {
            "name": "Personal Portfolio & Blog",
            "tech": ["React", "Tailwind CSS"],
            "desc": "Personal developer portfolio and technical blog platform."
        }
    ]
)

# 4. Priya Patel - AI/ML Engineer (PDF)
create_pdf("priya_patel_aiml.pdf", [
    "Priya Patel",
    "priya.patel@example.com | +1 (555) 432-1098 | Boston, MA",
    "",
    "PROFESSIONAL SUMMARY",
    "Innovative AI and Machine Learning Engineer with 4.5 years of experience in NLP, PyTorch, Transformers, LangChain, and FastAPI.",
    "",
    "TECHNICAL SKILLS",
    "Python, PyTorch, Machine Learning, NLP, Transformers, FastAPI, Docker, SQL, FAISS, Vector Databases",
    "",
    "WORK EXPERIENCE",
    "Senior Machine Learning Engineer - DeepCognition AI (2022 - Present, 2.5 years)",
    "- Designed retrieval-augmented generation pipelines and semantic search modules using vector embeddings.",
    "Machine Learning Specialist - Synthetix Labs (2020 - 2022, 2.0 years)",
    "- Trained deep learning models and deployed inference microservices via FastAPI.",
    "",
    "EDUCATION",
    "Master of Science in Artificial Intelligence - Northeastern University (2020)",
    "Bachelor of Technology in Computer Science - Pune University (2018)",
    "",
    "PROJECTS",
    "RAG Question Answering System - Tech: PyTorch, FastAPI, FAISS, Docker",
    "- Enterprise search engine delivering context-aware factual answers."
])

# 5. Maria Garcia - Frontend Specialist (PDF)
create_pdf("maria_garcia_frontend.pdf", [
    "Maria Garcia",
    "maria.garcia@example.com | +1 (555) 987-6543 | New York, NY",
    "",
    "PROFESSIONAL SUMMARY",
    "Frontend Engineer with 3.8 years of expertise in React, TypeScript, Tailwind CSS, REST APIs, and UI/UX design.",
    "",
    "TECHNICAL SKILLS",
    "React, TypeScript, JavaScript, Tailwind CSS, HTML, CSS, REST APIs, Git, Node.js",
    "",
    "WORK EXPERIENCE",
    "Frontend Developer - Lumina Digital (2021 - Present, 3.0 years)",
    "- Built interactive client applications and improved web accessibility.",
    "Web Developer - PixelCraft Studio (2020 - 2021, 0.8 years)",
    "- Designed UI components and responsive layouts.",
    "",
    "EDUCATION",
    "Bachelor of Arts in Interactive Media & Computing - NYU (2020)",
    "",
    "PROJECTS",
    "E-Commerce Design System - Tech: React, TypeScript, Tailwind CSS",
    "- Modular component library with accessible patterns."
])

# 6. Corrupted Resume for Scenario #3 Error Handling
corrupted_path = os.path.join(RESUME_DIR, "corrupted_sample.pdf")
with open(corrupted_path, "wb") as f:
    f.write(b"NOT_A_VALID_PDF_HEADER_JUST_RANDOM_CORRUPT_BYTES_XYZ1234567890!@#$%^&*()")
print(f"Created Corrupted PDF: {corrupted_path}")
