import LegalPageView from "../../component/legal/LegalPageView";
import { privacyPageContent } from "../../component/legal/legalData";

export default function PrivacyPage() {
  return <LegalPageView type="privacy" fallback={privacyPageContent} />;
}
