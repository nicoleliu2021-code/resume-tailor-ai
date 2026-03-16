"""
Test script for enhanced resume optimization with guardrails
Run with: python test_guardrails.py
"""

import asyncio
import json
from app.models.schemas import StructuredResume, Experience, Education, Skill, Project, JobAnalysis
from app.services.openai_service import optimize_resume_with_guardrails

# Sample resume data
SAMPLE_RESUME = {
    "name": "John Smith",
    "email": "john.smith@email.com",
    "phone": "(555) 123-4567",
    "linkedin": "linkedin.com/in/johnsmith",
    "location": "San Francisco, CA",
    "summary": "Product manager with 3 years of experience in fintech. Worked on mobile products and led teams. Passionate about user experience and data-driven decisions.",
    "experience": [
        {
            "id": "exp-1",
            "company": "Fintech Startup",
            "role": "Product Manager",
            "startDate": "01/2021",
            "endDate": "Present",
            "current": True,
            "bullets": [
                "Responsible for managing the mobile app roadmap",
                "Worked with engineering and design teams on new features",
                "Analyzed user data to improve retention",
                "Helped launch 3 major features last year",
                "Conducted user research and A/B tests"
            ]
        },
        {
            "id": "exp-2",
            "company": "E-commerce Company",
            "role": "Associate Product Manager",
            "startDate": "06/2019",
            "endDate": "12/2020",
            "current": False,
            "bullets": [
                "Assisted senior PMs with product planning",
                "Worked on checkout flow optimization",
                "Analyzed metrics and created dashboards"
            ]
        }
    ],
    "education": [
        {
            "id": "edu-1",
            "school": "Stanford University",
            "degree": "BS",
            "field": "Computer Science",
            "startDate": "09/2015",
            "endDate": "06/2019",
            "gpa": "3.7"
        }
    ],
    "skills": [
        {"id": "s1", "name": "Product Management", "category": "soft"},
        {"id": "s2", "name": "SQL", "category": "technical"},
        {"id": "s3", "name": "A/B Testing", "category": "technical"},
        {"id": "s4", "name": "Python", "category": "technical"},
        {"id": "s5", "name": "Figma", "category": "tool"},
        {"id": "s6", "name": "Amplitude", "category": "tool"}
    ],
    "projects": [],
    "rawText": ""
}

# Sample job description analysis (Rocket Money PM role)
SAMPLE_JOB_ANALYSIS = {
    "roleTitle": "Product Manager - Growth",
    "seniorityLevel": "Mid-Senior",
    "industry": "Fintech",
    "coreResponsibilities": [
        "Own product roadmap for acquisition and activation",
        "Lead cross-functional teams",
        "Design and analyze A/B tests",
        "Partner with data science for growth opportunities",
        "Define and track key metrics"
    ],
    "technicalSkills": [
        "Product Management",
        "SQL",
        "A/B Testing",
        "Analytics",
        "Growth Metrics",
        "Mobile Product",
        "Data Analysis"
    ],
    "softSkills": [
        "Cross-functional Leadership",
        "Communication",
        "Stakeholder Management",
        "Problem Solving"
    ],
    "hiringSignals": [
        "Track record of driving growth",
        "Experience with subscription models",
        "Data-driven decision making",
        "Mobile product expertise"
    ],
    "atsKeywords": [
        "product roadmap",
        "acquisition",
        "activation",
        "retention",
        "conversion funnels",
        "CAC",
        "LTV",
        "growth metrics",
        "cross-functional",
        "A/B testing",
        "SQL",
        "Amplitude",
        "Mixpanel",
        "mobile platform"
    ]
}


async def test_optimization():
    """Test the enhanced optimization with guardrails"""

    print("=" * 80)
    print("TESTING ENHANCED RESUME OPTIMIZATION WITH GUARDRAILS")
    print("=" * 80)

    # Create model instances
    resume = StructuredResume(**SAMPLE_RESUME)
    job_analysis = JobAnalysis(**SAMPLE_JOB_ANALYSIS)

    print("\n📄 ORIGINAL RESUME")
    print("-" * 80)
    print(f"Summary: {resume.summary}")
    print(f"\nExperience: {len(resume.experience)} jobs")
    for exp in resume.experience:
        print(f"\n  {exp.role} at {exp.company}")
        print(f"  Bullets: {len(exp.bullets)}")
        for i, bullet in enumerate(exp.bullets, 1):
            print(f"    {i}. {bullet}")

    print("\n🎯 TARGET JOB")
    print("-" * 80)
    print(f"Role: {job_analysis.roleTitle}")
    print(f"Seniority: {job_analysis.seniorityLevel}")
    print(f"Key Skills: {', '.join(job_analysis.technicalSkills[:5])}")
    print(f"ATS Keywords: {', '.join(job_analysis.atsKeywords[:10])}")

    print("\n🤖 RUNNING OPTIMIZATION WITH GUARDRAILS...")
    print("-" * 80)

    try:
        optimized_resume, changes, summary_change, experience_changes, metadata = await optimize_resume_with_guardrails(
            resume, job_analysis
        )

        print("\n✅ OPTIMIZATION COMPLETE")
        print("-" * 80)

        # Show summary changes
        if summary_change and summary_change.changeType != "no_change":
            print("\n📝 SUMMARY OPTIMIZATION")
            print("-" * 80)
            print(f"Change Type: {summary_change.changeType}")
            print(f"Confidence Score: {summary_change.confidenceScore}/100")
            print(f"Fabrication Risk: {summary_change.fabricationRisk.upper()}")
            print(f"\nOriginal:\n  {summary_change.originalSummary}")
            print(f"\nOptimized:\n  {summary_change.optimizedSummary}")
            print(f"\nExplanation:\n  {summary_change.explanation}")
            print(f"\nKeywords Added: {', '.join(summary_change.keywordsAdded)}")
            if summary_change.warningFlags:
                print(f"\n⚠️  Warnings: {', '.join(summary_change.warningFlags)}")

        # Show bullet changes
        print("\n📋 EXPERIENCE BULLET CHANGES")
        print("-" * 80)

        for exp_change in experience_changes:
            print(f"\n{exp_change.company} - {exp_change.experienceTitle}")
            print("-" * 40)

            changes_count = sum(1 for bc in exp_change.bulletChanges if bc.changeType != "no_change")
            print(f"Total changes: {changes_count}/{len(exp_change.bulletChanges)}")

            for bullet_change in exp_change.bulletChanges:
                if bullet_change.changeType != "no_change":
                    print(f"\n  Bullet #{bullet_change.bulletIndex + 1}:")
                    print(f"  Change Type: {bullet_change.changeType}")
                    print(f"  Confidence: {bullet_change.confidenceScore}/100")
                    print(f"  Risk: {bullet_change.fabricationRisk.upper()}")

                    print(f"\n  Before:")
                    print(f"    {bullet_change.originalBullet}")

                    print(f"\n  After:")
                    print(f"    {bullet_change.optimizedBullet}")

                    print(f"\n  Why:")
                    print(f"    {bullet_change.explanation}")

                    if bullet_change.keywordsAdded:
                        print(f"\n  Keywords: {', '.join(bullet_change.keywordsAdded)}")

                    if bullet_change.metricsAdded:
                        print(f"  Metrics: {', '.join(bullet_change.metricsAdded)}")

                    if bullet_change.warningFlags:
                        print(f"\n  ⚠️  WARNINGS: {', '.join(bullet_change.warningFlags)}")

                    print()

        # Show overall metadata
        print("\n📊 OPTIMIZATION METADATA")
        print("-" * 80)
        print(f"Total Bullets Changed: {metadata.totalBulletsChanged}")
        print(f"Total Keywords Added: {metadata.totalKeywordsAdded}")
        print(f"Average Confidence Score: {metadata.averageConfidenceScore}/100")
        print(f"High-Risk Changes: {metadata.highRiskChanges}")
        print(f"Medium-Risk Changes: {metadata.mediumRiskChanges}")
        print(f"Blocked Changes: {metadata.blockedChanges}")
        print(f"Overall Authenticity Score: {metadata.overallAuthenticityScore}/100")
        print(f"Estimated ATS Improvement: +{metadata.atsImprovementEstimate}%")

        # Risk assessment
        print("\n🛡️ RISK ASSESSMENT")
        print("-" * 80)
        if metadata.highRiskChanges > 0:
            print(f"⚠️  {metadata.highRiskChanges} HIGH-RISK changes detected!")
            print("   → User should manually review these changes")
        elif metadata.mediumRiskChanges > 0:
            print(f"⚡ {metadata.mediumRiskChanges} MEDIUM-RISK changes detected")
            print("   → User should verify accuracy of metrics")
        else:
            print("✅ All changes are low-risk or no-risk")
            print("   → Optimization is highly authentic")

        if metadata.overallAuthenticityScore >= 90:
            print("\n🌟 EXCELLENT: Resume feels natural and authentic")
        elif metadata.overallAuthenticityScore >= 75:
            print("\n👍 GOOD: Resume is improved with minor concerns")
        elif metadata.overallAuthenticityScore >= 60:
            print("\n⚠️  FAIR: Some AI language or questionable metrics")
        else:
            print("\n❌ POOR: Significant authenticity concerns")

        # Summary of changes (backwards compatible)
        print("\n📝 CHANGE SUMMARY (Backwards Compatible)")
        print("-" * 80)
        for change in changes:
            print(f"  • {change}")

        print("\n✅ TEST COMPLETE!")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("RESUME OPTIMIZATION WITH AI GUARDRAILS - TEST SCRIPT")
    print("=" * 80)
    print("\nThis test demonstrates:")
    print("  ✅ Detailed change tracking for every modification")
    print("  ✅ Confidence scores (0-100) for each change")
    print("  ✅ Fabrication risk assessment (none/low/medium/high)")
    print("  ✅ Explanations for why changes were made")
    print("  ✅ Keywords and metrics tracking")
    print("  ✅ Overall authenticity scoring")
    print("  ✅ Warning flags for risky changes")
    print("\n" + "=" * 80 + "\n")

    # Set mock mode for testing without OpenAI API
    import os
    os.environ["MOCK_MODE"] = "false"  # Set to "true" to test without API calls

    if os.getenv("MOCK_MODE", "false").lower() == "true":
        print("🧪 Running in MOCK MODE (no API calls)\n")
    else:
        print("🔴 Running in LIVE MODE (requires OpenAI API key)\n")
        if not os.getenv("OPENAI_API_KEY"):
            print("❌ ERROR: OPENAI_API_KEY not set!")
            print("   Set it in your .env file or export it:")
            print("   export OPENAI_API_KEY=your_key_here\n")
            exit(1)

    asyncio.run(test_optimization())
