import LegalPageView from "../../component/legal/LegalPageView";
import { termsPageContent } from "../../component/legal/legalData";

export default function TermsPage() {
  return <LegalPageView type="terms" fallback={termsPageContent} />;
}
