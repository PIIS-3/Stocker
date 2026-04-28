import { Hero } from '../components/organisms/Hero';
import { Features } from '../components/organisms/Features';
import { RoadmapCTA } from '../components/organisms/RoadmapCTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <RoadmapCTA />
    </main>
  );
}
