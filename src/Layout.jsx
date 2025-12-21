import Contacts from "./Contacts";
import Calendar from "./Calendar";
import Tasks from "./Tasks";
import "./App.css";
import sampleData from "../sampleContacts.json";

export default function ThreeColumnLayout() {
  return (
    <div className="three-column-layout">
      <div className="column">
        <Contacts data={sampleData}/>
      </div>
      <div className="column">
        <Tasks />
      </div>
      <div className="column">
        <Calendar />
      </div>
    </div>
  );
}