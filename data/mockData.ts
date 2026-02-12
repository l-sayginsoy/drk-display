import { AppData } from '../types';
import { getCalendarWeek } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

const currentWeek = getCalendarWeek(new Date());
const nextWeek = currentWeek + 1;

export const initialData: AppData = {
  urgentMessage: {
    active: false,
    title: 'Wichtiger Hinweis',
    text: 'Heute Nachmittag fällt die Gymnastikgruppe aus.',
    imageUrl: 'https://picsum.photos/seed/urgent/1280/720',
    activeUntil: '18:00',
  },
  meals: [
    {
      name: 'Frühstück',
      startTime: { hour: 7, minute: 15 },
      endTime: { hour: 8, minute: 30 },
      imageUrl: 'assets/Frühstück.jpg',
    },
    {
      name: 'Mittagessen',
      startTime: { hour: 11, minute: 15 },
      endTime: { hour: 12, minute: 30 },
      imageUrl: 'assets/Mittagessen.jpg',
    },
    {
      name: 'Kaffee und Kuchen',
      startTime: { hour: 14, minute: 15 },
      endTime: { hour: 15, minute: 30 },
      imageUrl: 'assets/Nachmittagskaffee.jpg',
    },
    {
      name: 'Abendessen',
      startTime: { hour: 17, minute: 15 },
      endTime: { hour: 18, minute: 30 },
      imageUrl: 'assets/Abendessen.jpg',
    },
  ],
  slideshow: {
    active: false,
    activeUntil: '22:00',
    images: [
      { id: 'menu-plan-static', url: 'assets/Speiseplan.jpg', caption: 'Aktueller Speiseplan' },
      { id: uuidv4(), url: 'https://picsum.photos/seed/lu1/1280/720', caption: 'Ludwigshafen am Rhein' },
      { id: uuidv4(), url: 'https://picsum.photos/seed/resident1/1280/720', caption: 'Unser Sommerfest' },
      { id: uuidv4(), url: 'https://picsum.photos/seed/lu2/1280/720', caption: 'Parkinsel Ludwigshafen' },
      { id: uuidv4(), url: 'https://picsum.photos/seed/resident2/1280/720', caption: 'Bastelnachmittag' },
      { id: uuidv4(), url: 'https://picsum.photos/seed/lu3/1280/720', caption: 'Sonnenuntergang über der Stadt' },
    ],
  },
  weeklySchedule: {
    [currentWeek]: [
      { day: 'Montag', events: [{id: 'mon1', time: '10:00', title: 'Sitzgymnastik', location: 'Gemeinschaftsraum' }, { id: 'mon2', time: '14:30', title: 'Vorlesestunde', location: 'Bibliothek' }] },
      { day: 'Dienstag', events: [{ id: 'tue1', time: '11:00', title: 'Gedächtnistraining', location: 'Raum A' }] },
      { day: 'Mittwoch', events: [{ id: 'wed1', time: '09:30', title: 'Marktbesuch', location: 'Foyer' }, { id: 'wed2', time: '15:00', title: 'Bingo', location: 'Gemeinschaftsraum' }] },
      { day: 'Donnerstag', events: [{ id: 'thu1', time: '10:00', title: 'Kreatives Gestalten', location: 'Werkraum' }] },
      { day: 'Freitag', events: [{ id: 'fri1', time: '14:00', title: 'Waffeln backen', location: 'Küche' }] },
      { day: 'Samstag', events: [{ id: 'sat1', time: '15:00', title: 'Filmvorführung', location: 'Gemeinschaftsraum' }] },
      { day: 'Sonntag', events: [{ id: 'sun1', time: '10:30', title: 'Gottesdienst', location: 'Kapelle' }] },
    ],
    [nextWeek]: [
        { day: 'Montag', events: [{id: 'n-mon1', time: '10:00', title: 'Sitzgymnastik', location: 'Gemeinschaftsraum' }] },
        { day: 'Dienstag', events: [] },
        { day: 'Mittwoch', events: [{ id: 'n-wed1', time: '15:00', title: 'Bingo', location: 'Gemeinschaftsraum' }] },
        { day: 'Donnerstag', events: [] },
        { day: 'Freitag', events: [{ id: 'n-fri1', time: '14:00', title: 'Spielenachmittag', location: 'Raum B' }] },
        { day: 'Samstag', events: [] },
        { day: 'Sonntag', events: [] },
    ]
  },
  quotes: [
    'Der Weg ist das Ziel.',
    'Lächle und die Welt verändert sich.',
    'Jeder Tag ist ein neuer Anfang.',
    'Die kleinen Dinge sind es, die das Leben ausmachen.',
    'Glück ist die Summe schöner Momente.'
  ],
  locations: [
    'Cafeteria',
    'Kleiner Saal',
    'Garten',
    'Terrasse',
    'Wohnbereich',
    'Speisesaal',
    'Gemeinschaftsraum',
    'Bibliothek',
    'Foyer',
    'Werkraum',
    'Küche',
    'Kapelle',
    'Raum A',
    'Raum B'
  ]
};