import logo from './logo.svg';
import './App.css';
import RoomSession from './components/RoomSession';
import { PipecatClient } from "@pipecat-ai/client-js";
import {
  PipecatClientProvider,
  PipecatClientAudio,
  usePipecatClient,
} from "@pipecat-ai/client-react";
import { DailyTransport } from "@pipecat-ai/daily-transport";

// Create the client instance
const client = new PipecatClient({
  transport: new DailyTransport(),
  enableMic: true,
});

function App() {
  return (
    <div className="App">
        <RoomSession/>
    </div>
  );
}

export default App;
