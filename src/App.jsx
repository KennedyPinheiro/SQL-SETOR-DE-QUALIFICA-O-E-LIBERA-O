import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import PracticePage from './pages/PracticePage.jsx';

const screenComponents = {
  home: HomePage,
  game: GamePage,
  practice: PracticePage
};

export default function App({ screen }) {
  const Screen = screenComponents[screen] || HomePage;
  return <Screen />;
}
