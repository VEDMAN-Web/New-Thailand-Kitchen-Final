import HomePage from "../component/HomePage";
import { fetchMergedProducts } from "../services/cmsPublic";

export default async function Home() {
  const initialProducts = await fetchMergedProducts().catch(() => []);

  return (
    <main className="w-full">
      <HomePage initialProducts={initialProducts} />
    </main>
  );
}