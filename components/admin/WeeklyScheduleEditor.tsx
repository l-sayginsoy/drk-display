import React, { useState } from 'react';
import { AppData, Event, DaySchedule } from '../../types';
import { getCalendarWeek } from '../../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyScheduleEditorProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
}

const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const emptyWeek: DaySchedule[] = dayNames.map(day => ({ day, events: [] }));

const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({ appData, setAppData }) => {
    const [currentWeek, setCurrentWeek] = useState(getCalendarWeek(new Date()));
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [addingToDay, setAddingToDay] = useState<string | null>(null);
    
    const handleWeekChange = (direction: 'prev' | 'next') => {
        setCurrentWeek(prev => direction === 'next' ? prev + 1 : prev - 1);
    };

    const getDateForDay = (dayIndex: number): string => {
        const today = new Date();
        const currentDayOfWeek = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
        const currentKW = getCalendarWeek(today);
        
        const dayDifference = dayIndex - currentDayOfWeek;
        const weekDifference = (currentWeek - currentKW) * 7;
        
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayDifference + weekDifference);
        
        return targetDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    };

    const handleUpdateEvent = (day: string, updatedEvent: Event) => {
        setAppData(prev => {
            const newSchedule = { ...prev.weeklySchedule };
            const weekData = newSchedule[currentWeek];
            if (!weekData) return prev;

            const dayIndex = weekData.findIndex(d => d.day === day);
            if (dayIndex === -1) return prev;
            
            const updatedEvents = [updatedEvent];

            const updatedWeekData = [...weekData];
            updatedWeekData[dayIndex] = {
                ...weekData[dayIndex],
                events: updatedEvents
            };

            newSchedule[currentWeek] = updatedWeekData;

            return { ...prev, weeklySchedule: newSchedule };
        });
        setEditingEvent(null);
    };
    
    const handleAddEvent = (day: string, newEventData: Omit<Event, 'id'>) => {
        const newEvent = { ...newEventData, id: uuidv4() };
         setAppData(prev => {
            const newSchedule = { ...prev.weeklySchedule };
            
            const weekData = newSchedule[currentWeek] 
                ? [...newSchedule[currentWeek]] 
                : JSON.parse(JSON.stringify(emptyWeek));

            const dayIndex = weekData.findIndex(d => d.day === day);
            
            if (dayIndex > -1) {
                const dayData = { ...weekData[dayIndex] };
                dayData.events = [newEvent];
                weekData[dayIndex] = dayData;
            }
            
            newSchedule[currentWeek] = weekData;

            return { ...prev, weeklySchedule: newSchedule };
        });
        setAddingToDay(null);
    };

    const handleDeleteEvent = (day: string, eventId: string) => {
        setAppData(prev => {
            const newSchedule = { ...prev.weeklySchedule };
            const dayIndex = newSchedule[currentWeek]?.findIndex(d => d.day === day);
            if (dayIndex !== undefined && dayIndex > -1) {
                 newSchedule[currentWeek][dayIndex].events = [];
            }
            return { ...prev, weeklySchedule: newSchedule };
        });
    };
    
    const weekData = appData.weeklySchedule[currentWeek] || emptyWeek;

    const renderDayEditor = (day: string, index: number) => {
        const dayData = weekData.find(d => d.day === day) || { day, events: [] };
        const event = dayData.events[0];
        return (
            <div key={day} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg text-gray-700">{day}</h3>
                    <span className="text-sm font-medium text-gray-500">{getDateForDay(index)}</span>
                </div>
                <div className="space-y-2">
                   {(() => {
                       if (editingEvent && event && editingEvent.id === event.id) {
                           return <EventForm key={event.id} event={event} onSave={(updated) => handleUpdateEvent(day, updated as Event)} onCancel={() => setEditingEvent(null)} locations={appData.locations}/>;
                       }
                       
                       if (addingToDay === day) {
                           return <EventForm onSave={(newEventData) => handleAddEvent(day, newEventData)} onCancel={() => setAddingToDay(null)} locations={appData.locations}/>;
                       }

                       if (event) {
                           return <EventItem key={event.id} event={event} onEdit={() => setEditingEvent(event)} onDelete={() => handleDeleteEvent(day, event.id)} />;
                       }

                       return (
                            <button onClick={() => setAddingToDay(day)} className="w-full mt-2 flex items-center justify-center space-x-2 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition">
                                <Plus size={18} />
                                <span>Termin hinzufügen</span>
                            </button>
                       );
                   })()}
                </div>
            </div>
        );
    };

    return (
        <section className="bg-white p-6 rounded-xl shadow-md flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Wochenprogramm</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleWeekChange('prev')} className="p-2 rounded-md hover:bg-gray-100 text-gray-500"><ChevronLeft /></button>
                    <div className="text-center font-semibold text-red-600 bg-red-100 rounded-lg px-4 py-2">
                        KW {currentWeek}
                    </div>
                    <button onClick={() => handleWeekChange('next')} className="p-2 rounded-md hover:bg-gray-100 text-gray-500"><ChevronRight /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                    {dayNames.slice(0, 4).map((day, index) => renderDayEditor(day, index))}
                </div>
                <div className="space-y-4">
                    {dayNames.slice(4).map((day, i) => renderDayEditor(day, i + 4))}
                </div>
            </div>
        </section>
    );
};

interface EventItemProps {
    event: Event;
    onEdit: () => void;
    onDelete: () => void;
}
const EventItem: React.FC<EventItemProps> = ({event, onEdit, onDelete}) => (
    <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
        <div className="flex items-center flex-1 min-w-0 mr-4">
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate" title={event.title}>{event.title}</p>
                <p className="text-sm text-gray-500 truncate mt-1" title={event.location}>{event.location}</p>
            </div>
            <span className="font-bold text-gray-800 pl-3">{event.time}</span>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"><Edit size={16}/></button>
            <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"><Trash2 size={16}/></button>
        </div>
    </div>
);

interface EventFormProps {
    event?: Event;
    onSave: (data: any) => void;
    onCancel: () => void;
    locations: string[];
}
const EventForm: React.FC<EventFormProps> = ({event, onSave, onCancel, locations}) => {
    const [time, setTime] = useState(event?.time || '12:30');
    const [title, setTitle] = useState(event?.title || '');
    const [location, setLocation] = useState(event?.location || locations[0] || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave( event ? { ...event, time, title, location } : { time, title, location });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-3 rounded-md shadow-sm border border-blue-500 space-y-3 animate-fade-in">
             <div className="grid grid-cols-3 gap-2">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Aktivität" className="col-span-2 p-2 border rounded-md bg-gray-50 w-full text-gray-900" required/>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-2 border rounded-md bg-gray-50 w-full text-gray-900" required/>
            </div>
             <select value={location} onChange={e => setLocation(e.target.value)} className="p-2 border rounded-md bg-gray-50 w-full text-gray-900" required>
                <option value="" disabled>Ort wählen...</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
             </select>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={20}/></button>
                <button type="submit" className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"><Save size={20}/></button>
            </div>
        </form>
    );
};


export default WeeklyScheduleEditor;