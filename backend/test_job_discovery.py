"""
Test script for job discovery engine
Run with: python test_job_discovery.py
"""

from app.models.schemas import StructuredResume, Experience, Skill, Education, Project
from app.services.job_matcher import match_jobs


# Create sample resume (Product Manager)
sample_resume = StructuredResume(
    summary="Senior Product Manager with 8 years of experience in B2B SaaS. Expert in product strategy, roadmapping, and data-driven decision making.",
    experience=[
        Experience(
            id="exp1",
            company="TechCorp",
            role="Senior Product Manager",
            startDate="01/2020",
            endDate="Present",
            current=True,
            bullets=[
                "Led product roadmap for B2B SaaS platform serving 500+ customers",
                "Increased user engagement by 45% through data-driven feature prioritization",
                "Managed cross-functional teams of 12 engineers and designers"
            ]
        ),
        Experience(
            id="exp2",
            company="StartupCo",
            role="Product Manager",
            startDate="01/2018",
            endDate="12/2019",
            current=False,
            bullets=[
                "Launched 3 major features that drove 30% revenue growth",
                "Conducted user research with 100+ customers",
                "Collaborated with engineering on technical feasibility"
            ]
        ),
        Experience(
            id="exp3",
            company="ConsultingFirm",
            role="Product Analyst",
            startDate="06/2016",
            endDate="12/2017",
            current=False,
            bullets=[
                "Analyzed product metrics using SQL and Excel",
                "Created dashboards in Tableau for executive reporting",
                "Supported product managers with competitive analysis"
            ]
        )
    ],
    education=[
        Education(
            id="edu1",
            school="University of California",
            degree="Bachelor of Science",
            field="Computer Science",
            startDate="09/2012",
            endDate="05/2016",
            gpa="3.7"
        )
    ],
    skills=[
        Skill(id="s1", name="Product Strategy", category="technical"),
        Skill(id="s2", name="Roadmapping", category="technical"),
        Skill(id="s3", name="SQL", category="technical"),
        Skill(id="s4", name="Data Analysis", category="technical"),
        Skill(id="s5", name="User Research", category="technical"),
        Skill(id="s6", name="Agile", category="technical"),
        Skill(id="s7", name="Stakeholder Management", category="soft"),
        Skill(id="s8", name="Figma", category="tool"),
        Skill(id="s9", name="Jira", category="tool"),
    ],
    projects=[
        Project(
            id="p1",
            name="Product Analytics Dashboard",
            description="Built internal analytics tool",
            technologies=["SQL", "Tableau", "Python"]
        )
    ]
)


def test_job_discovery():
    """Test job discovery with sample resume"""
    print("=" * 80)
    print("TESTING JOB DISCOVERY ENGINE")
    print("=" * 80)
    print("\nSample Resume Profile:")
    print(f"  - Name: {sample_resume.experience[0].role} at {sample_resume.experience[0].company}")
    print(f"  - Years of Experience: ~{len(sample_resume.experience) * 2} years")
    print(f"  - Top Skills: {', '.join([s.name for s in sample_resume.skills[:5]])}")
    print("\n" + "=" * 80)
    print("DISCOVERING JOBS...\n")

    # Run job matching
    job_matches = match_jobs(sample_resume, limit=5, min_score=60.0)

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
            for skill in match.missingSkills:
                print(f"     ⚠️  {skill}")

        print(f"\n   Required Skills: {', '.join(match.job.requiredSkills[:5])}")
        print("\n" + "-" * 80 + "\n")

    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    test_job_discovery()
