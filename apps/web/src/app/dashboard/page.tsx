import ClassicScreen from '@/components/screens/classic-screen';
import { getAllPitches } from '@/db/queries/pitches';

export default async function IndexPageClassic() {
  const pitches = await getAllPitches();

  console.log(pitches);

  return <ClassicScreen pitches={pitches} />;
}
