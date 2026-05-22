'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import SectionHeader from './SectionHeader';
import PhotoDetailModal from './PhotoDetailModal';

export default function PhotoDropWidget({ section, st, fontScale }: any) {
  const useBg = section.useBackgroundColor;
  const align = section.textAlign || 'center';
  const builderImages = section.images || []; // Images added in the builder

  const [dbImages, setDbImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitationId, setInvitationId] = useState<string>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPublished = window.location.pathname.includes('/lovecard/');
      const currentId = isPublished ? window.location.pathname.split('/').pop() || 'preview' : 'preview';
      setInvitationId(currentId);
    }
  }, []);

  useEffect(() => {
    // Fetch images from DB if possible
    if (invitationId === 'preview') return;
    
    fetch(`/api/photo-drop/images?invitationId=${invitationId}`)
      .then(res => res.json())
      .then(data => {
        if (data.images) {
          setDbImages(data.images);
        }
      })
      .catch(err => console.error('Error fetching photo drop images:', err));
  }, [invitationId]);

  // Combine builder images and db images
  const combinedImages = [
    ...builderImages.map((img: any, i: number) => ({ ...img, id: `local_${i}`, isLocal: true })),
    ...dbImages
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // We can directly upload them to Supabase Storage if configured.
    // For now, let's create local Object URLs to show immediately,
    // and attempt to save them to the database.
    // Note: Actually saving files requires Supabase Storage or similar.
    // Here we'll simulate the upload by keeping it in state and calling the API with base64/object URL.
    
    Array.from(files).forEach(async (file) => {
      const tempUrl = URL.createObjectURL(file);
      
      // Update local state immediately for UX
      const newImg = {
        id: 'temp_' + Date.now() + Math.random(),
        url: tempUrl,
        uploader_name: '하객',
        view_count: 0,
        likesCount: 0
      };
      setDbImages(prev => [newImg, ...prev]);

      // Note: Real implementation would upload `file` to S3/Supabase Storage, get public URL,
      // and then call the API. Here we just pass the object URL to the DB (which won't work across devices, but satisfies the prototype).
      // In a real scenario, implement Supabase Storage upload here.
      /*
      try {
        const formData = new FormData();
        formData.append('file', file);
        // ... upload to storage ...
        // const publicUrl = ...
        
        await fetch('/api/photo-drop/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationId, url: tempUrl, uploaderName: '하객' })
        });
      } catch (err) {
        console.error('Upload failed', err);
      }
      */
    });
  };

  const openModal = (img: any) => {
    setSelectedImage(img);
    setIsModalOpen(true);
  };

  return (
    <div
      className={`px-8 py-16 relative group overflow-hidden ${useBg ? 'bg-[#F9FAFB]' : 'bg-white'} transition-all`}
      style={{ ...st }}
    >
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <SectionHeader
        title={section.title || '포토드롭'}
        englishLabel="PHOTO DROP"
        fontScale={fontScale}
        textColor={st.color}
        align={align as any}
      />
      
      {section.description && (
        <p className="text-[13px] text-stone-500 leading-relaxed text-center -mt-6 mb-10 break-keep mx-auto opacity-75 max-w-[280px]" style={{ fontSize: `${13 * fontScale}px` }}>{section.description}</p>
      )}

      <div className="w-full relative rounded-2xl overflow-hidden min-h-[220px] bg-stone-50 border border-stone-200/40 flex flex-col items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        {combinedImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 p-2 w-full animate-fade-in relative z-10">
            {combinedImages.map((img: any, i: number) => (
              <div key={img.id || i} className="aspect-square bg-stone-100 overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition-opacity relative z-20" onClick={() => openModal(img)}>
                <img src={img.url} className="w-full h-full object-cover pointer-events-none" alt="" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center select-none animate-fade-in relative z-10">
            <div className="text-[9.5px] font-bold text-stone-400 tracking-[0.25em] uppercase">PHOTO DROP</div>
            <h4 className="text-[17px] font-serif font-medium text-stone-700">포토 드롭</h4>
            <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-200 rounded-full text-[12px] font-bold text-stone-600 shadow-sm transition-all hover:bg-stone-50 active:scale-95 cursor-pointer z-20">
              <Camera size={14} className="text-stone-400" />
              <span>사진 올리기</span>
            </div>
            <p className="text-[12px] text-stone-300 font-medium">아직 사진이 없습니다</p>
          </div>
        )}

        {/* 호버 시 업로드 오버레이 (사진이 있을 때도 호버 시 업로드 버튼 노출) */}
        <div className="absolute inset-0 bg-stone-900/40 flex flex-col items-center justify-center gap-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
          {combinedImages.length === 0 && (
            <>
              <div className="text-[9.5px] font-bold text-white/80 tracking-[0.25em] uppercase animate-pulse">PHOTO DROP</div>
              <h4 className="text-[17px] font-serif font-medium text-white">포토 드롭</h4>
            </>
          )}
          <div className="flex items-center gap-2 px-6 py-2.5 bg-white text-stone-800 rounded-full text-[12px] font-bold shadow-lg transition-all pointer-events-auto cursor-pointer hover:scale-105 active:scale-95" onClick={() => fileInputRef.current?.click()}>
            <Camera size={14} className="text-stone-600" />
            <span>{combinedImages.length > 0 ? '사진 더 추가하기' : '사진 올리기'}</span>
          </div>
          {combinedImages.length === 0 && <p className="text-[12px] text-white/60 font-medium">아직 사진이 없습니다</p>}
        </div>
      </div>

      <PhotoDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        image={selectedImage} 
        invitationId={invitationId}
      />
    </div>
  );
}
