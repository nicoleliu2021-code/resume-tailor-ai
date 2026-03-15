"""
Test job discovery with Software Engineer resume
"""

from app.models.schemas import StructuredResume, Experience, Skill, Education, Project
from app.services.job_matcher import match_jobs


# Create sample resume (Software Engineer with some PM experience)
sample_resume = StructuredResume(
    summary="Software Engineer with 5 years of full-stack development experience. Skilled in React, Node.js, and PostgreSQL.",
    experience=[
        Experience(
            id="exp1",
            company="StartupCo",
            role="Senior Software Engineer",
            startDate="01/2021",
            endDate="Present",
            current=True,
            bullets=[
                "Built scalable web applications using React and Node.js",
                "Led technical design for new features serving 100K users",
                "Mentored 2 junior engineers"
            ]
        ),
        Experience(
            id="exp2",
            company="TechCorp",
            role="Software Engineer",
            startDate="06/2019",
            endDate="12/2020",
            current=False,
            bullets=[
                "Developed REST APIs using Python and FastAPI",
                "Optimized database queries reducing load time by 40%",
                "Wrote automated tests achieving 90% code coverage"
            ]
        )
    ],
    education=[
        Education(
            id="edu1",
            school="UC Berkeley",
            degree="Bachelor of Science",
            field="Computer Science",
            startDate="09/2015",
            endDate="05/2019",
            gpa="3.6"
        )
    ],
    skills=[
        Skill(id="s1", name="JavaScript", category="technical"),
        Skill(id="s2", name="React", category="technical"),
        Skill(id="s3", name="Node.js", category="technical"),
        Skill(id="s4", name="Python", category="technical"),
        Skill(id="s5", name="PostgreSQL", category="technical"),
        Skill(id="s6", name="SQL", category="technical"),
        Skill(id="s7", name="TypeScript", category="technical"),
        Skill(id="s8", name="Git", category="tool"),
        Skill(id="s9", name="Docker", category="tool"),
        Skill(id="s10", name="AWS", category="tool"),
    ],
    projects=[
        Project(
            id="p1",
            name="E-commerce Platform",
            description="Built full-stack e-commerce site",
            technologies=["React", "Node.js", "PostgreSQL"]
        )
    ]
)


def test_job_discovery():
    """Test job discovery with sample resume"""
    print("=" * 80)
    print("TESTING JOB DISCOVERY ENGINE - SOFTWARE ENGINEER PROFILE")
    print("=" * 80)
    print("\nSample Resume Profile:")
    print(f"  - Name: {sample_resume.experience[0].role} at {sample_resume.experience[0].company}")
    print(f"  - Years of Experience: ~{len(sample_resume.experience) * 2} years")
    print(f"  - Top Skills: {', '.join([s.name for s in sample_resume.skills[:6]])}")
    print("\n" + "=" * 80)
    print("DISCOVERING JOBS...\n")

    # Run job matching
    job_matches = match_jobs(sample_resume, limit=10, min_score=50.0)  # Lower threshold to see more

    print(f"Found {len(job_matches)} matching jobs:\n")

    for i, match in enumerate(job_matches, 1):
        print(f"{i}. {match.job.title} at {match.job.company}")
        print(f"   Fit Score: {match.fitScore}% ({match.matchType.upper()} match)")
        print(f"   Location: {match.job.location} | Remote: {'Yes' if match.job.remote else 'No'}")
        print(f"   Salary: {match.job.salary}")
        print(f"\n   Why it matches:")
        for reason in match.matchReasons:
            print(f"     ✓ {reason}")

        if match.missingSkills:
            print(f"\n   Missing skills:")
            for skill in match.missingSkills[:3]:
                print(f"     ⚠️  {skill}")

        print(f"\n   Required Skills: {', '.join(match.job.requiredSkills[:5])}")
        print("\n" + "-" * 80 + "\n")

    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    test_job_discovery()
