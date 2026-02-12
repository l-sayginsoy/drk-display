import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppData, SlideshowImage, SlideshowData } from '../../types';
import WeeklyScheduleEditor from './WeeklyScheduleEditor';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Trash2, Image as ImageIcon, Power, Clock } from 'lucide-react';

interface AdminPanelProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminPanel: React.FC<AdminPanelProps> = ({ appData, setAppData }) => {
    const [urgentMessage, setUrgentMessage] = useState(appData.urgentMessage);
    const [slideshowConfig, setSlideshowConfig] = useState(appData.slideshow);
    const [newSlideCaption, setNewSlideCaption] = useState('');
    const [newSlideImage, setNewSlideImage] = useState<File | null>(null);

    const handleUrgentMessageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const updatedValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

        const updatedMessage = { ...urgentMessage, [name]: updatedValue };
        setUrgentMessage(updatedMessage);
        setAppData(prev => ({ ...prev, urgentMessage: updatedMessage }));
    };

    const handleUrgentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            const updatedMessage = { ...urgentMessage, imageUrl: base64 };
            setUrgentMessage(updatedMessage);
            setAppData(prev => ({ ...prev, urgentMessage: updatedMessage }));
        }
    };

    const handleSlideshowConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const updatedValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
        
        const updatedConfig = { ...slideshowConfig, [name]: updatedValue };
        setSlideshowConfig(updatedConfig);
        setAppData(prev => ({ ...prev, slideshow: updatedConfig }));
    };
    
    const handleAddSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlideImage || !newSlideCaption) return;
        
        const imageUrl = await fileToBase64(newSlideImage);
        const newSlide: SlideshowImage = { id: uuidv4(), url: imageUrl, caption: newSlideCaption };

        setAppData(prev => ({ 
            ...prev, 
            slideshow: {
                ...prev.slideshow,
                images: [...prev.slideshow.images, newSlide]
            } 
        }));
        
        // Update local state to re-render
        setSlideshowConfig(prev => ({...prev, images: [...prev.images, newSlide]}));

        setNewSlideCaption('');
        setNewSlideImage(null);
        // Reset file input
        const fileInput = document.getElementById('slide-image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    };

    const handleDeleteSlide = (id: string) => {
        const updatedImages = slideshowConfig.images.filter(s => s.id !== id);
        const updatedConfig = { ...slideshowConfig, images: updatedImages };
        setSlideshowConfig(updatedConfig);
        setAppData(prev => ({ ...prev, slideshow: updatedConfig }));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
            <div className="max-w-screen-xl mx-auto">
                <header className="flex items-center justify-between pb-4 border-b-2 border-gray-200 mb-6">
                     <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
                            <img src="/assets/drk-logo-white.svg" alt="DRK Logo" className="h-10"/>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                            <p className="text-gray-500">DRK Melm Verwaltung</p>
                        </div>
                    </div>
                    <Link to="/display" className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                        Zur Display-Ansicht
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-2 flex">
                        <WeeklyScheduleEditor appData={appData} setAppData={setAppData} />
                    </div>
                    
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Eilmeldung</h2>
                            <div className="flex items-center space-x-4 mb-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="active" checked={urgentMessage.active} onChange={handleUrgentMessageChange} className="sr-only peer" />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                                <span className={`text-lg font-medium transition-colors ${urgentMessage.active ? 'text-red-600' : 'text-gray-700'}`}>{urgentMessage.active ? 'Aktiviert' : 'Deaktiviert'}</span>
                            </div>
                            {urgentMessage.active && (
                                <div className="space-y-4 animate-fade-in">
                                    <input type="text" name="title" value={urgentMessage.title} onChange={handleUrgentMessageChange} placeholder="Titel der Meldung" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition" />
                                    <textarea name="text" value={urgentMessage.text} onChange={handleUrgentMessageChange} placeholder="Text der Meldung" className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-red-500 transition"></textarea>
                                     <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Clock size={18} className="text-gray-400" />
                                        </div>
                                        <input type="time" name="activeUntil" value={urgentMessage.activeUntil} onChange={handleUrgentMessageChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition bg-gray-50" />
                                    </div>
                                    <label htmlFor="urgent-image-upload" className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition">
                                        <Upload size={20} />
                                        <span>Hintergrundbild ändern</span>
                                    </label>
                                    <input id="urgent-image-upload" type="file" accept="image/*" onChange={handleUrgentImageUpload} className="hidden" />
                                    {urgentMessage.imageUrl && <img src={urgentMessage.imageUrl} alt="Vorschau" className="mt-2 rounded-lg object-cover w-full h-32"/>}
                                </div>
                            )}
                        </section>
                         <section className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Diashow Steuerung</h2>
                            <div className="flex items-center space-x-4 mb-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="active" checked={slideshowConfig.active} onChange={handleSlideshowConfigChange} className="sr-only peer" />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className={`text-lg font-medium transition-colors ${slideshowConfig.active ? 'text-blue-600' : 'text-gray-700'}`}>{slideshowConfig.active ? 'Aktiviert' : 'Deaktiviert'}</span>
                            </div>
                            {slideshowConfig.active && (
                                <div className="space-y-4 animate-fade-in">
                                     <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Clock size={18} className="text-gray-400" />
                                        </div>
                                        <input type="time" name="activeUntil" value={slideshowConfig.activeUntil} onChange={handleSlideshowConfigChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition bg-gray-50" />
                                    </div>
                                </div>
                            )}
                        </section>
                        <section className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Diashow Bilder</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {slideshowConfig.images.map(slide => (
                                <div key={slide.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <img src={slide.url} alt={slide.caption} className="w-12 h-12 rounded-md object-cover flex-shrink-0"/>
                                        <span className="font-medium text-gray-700 truncate" title={slide.caption}>{slide.caption}</span>
                                    </div>
                                    <button onClick={() => handleDeleteSlide(slide.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition flex-shrink-0 ml-2">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            ))}
                            </div>
                            <form onSubmit={handleAddSlide} className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                <input type="text" value={newSlideCaption} onChange={e => setNewSlideCaption(e.target.value)} placeholder="Neue Bildunterschrift" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" required/>
                                <label htmlFor="slide-image-upload" className="w-full cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition">
                                    <ImageIcon size={20} />
                                    <span>Bild auswählen...</span>
                                </label>
                                {newSlideImage && <span className="text-sm text-gray-500 block text-center">{newSlideImage.name}</span>}
                                <input id="slide-image-upload" type="file" accept="image/*" onChange={e => setNewSlideImage(e.target.files ? e.target.files[0] : null)} className="hidden" required/>
                                <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                    Bild hinzufügen
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;