import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

files = [
    "app/(app)/dashboard/page.tsx",
    "app/(app)/report/page.tsx",
    "app/(app)/settings/profile/page.tsx",
    "app/(app)/subscribe/page.tsx",
    "app/(app)/transit/page.tsx",
    "app/auth-error/page.tsx",
    "app/check-email/page.tsx",
    "app/globals.css",
    "app/login/LoginForm.tsx",
    "app/login/page.tsx",
    "app/onboarding/page.tsx",
    "components/dashboard/CosmicGuidanceCard.tsx",
    "components/dashboard/DashaCard.tsx",
    "components/dashboard/DashboardSidebar.tsx",
    "components/dashboard/ForecastCard.tsx",
    "components/dashboard/HumanDesignTypeCard.tsx",
    "components/dashboard/TransitCard.tsx",
    "components/insights/DailyInsightCard.tsx",
    "components/insights/LifePhaseIndicator.tsx",
    "components/insights/TodaysGuidance.tsx",
    "components/layout/Footer.tsx",
    "components/onboarding/BirthDataForm.tsx",
    "components/onboarding/UnknownTimeNotice.tsx",
    "components/report/DashboardReport.tsx",
    "components/transit/TodaysTransitForm.tsx",
    "components/v2/TodaysGuidance.tsx",
    "components/v2/TopNav.tsx",
    "styles/dashboard.css",
    "styles/v2.css",
    "lib/email/templates/DailyInsightEmail.tsx",
    "lib/email/templates/WelcomeEmail.tsx",
]

FROM = ['"Cormorant Garamond", serif', "'Cormorant Garamond', serif"]
TO = "Cinzel, serif"

for rel in files:
    path = os.path.join(BASE, rel)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as fh:
        txt = fh.read()
    new = txt
    for f in FROM:
        new = new.replace(f, TO)
    if new != txt:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new)
        print("updated:", rel)

print("done")
