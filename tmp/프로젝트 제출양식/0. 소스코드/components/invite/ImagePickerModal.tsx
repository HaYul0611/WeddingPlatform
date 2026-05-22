'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Trash2, X, Upload, Check, Crop, ChevronDown, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Scissors } from 'lucide-react';
import './ImagePickerModal.css';

interface SectionItem {
  id: string;
  type: string;
  title: string;
  [key: string]: any;
}

export default function ImagePickerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | undefined>(undefined);
  const [onSelectCallback, setOnSelectCallback] = useState<((url: string) => void) | null>(null);
  const [inUseImages, setInUseImages] = useState<string[]>([]);

  const [selectedTab, setSelectedTab] = useState<'all' | 'inUse' | 'unused'>('all');
  const [sharpen, setSharpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // 선택 모드 및 툴바 상태
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 이미지 크로퍼 모달 상태
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropRotate, setCropRotate] = useState(0); // 0, 90, 180, 270
  const [cropFlipH, setCropFlipH] = useState(false);
  const [cropFlipV, setCropFlipV] = useState(false);
  const [cropRatio, setCropRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '9:16'>('free');

  // 삭제 취소(되돌리기) 상태
  const [deletedImagesBuffer, setDeletedImagesBuffer] = useState<string[]>([]);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 인터랙티브 크롭 영역 제어 상태 (퍼센트 단위: 0 ~ 100)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'tl', 'tc', 'tr', 'lc', 'rc', 'bl', 'bc', 'br'

  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // 초고속 Native 렌더링 및 랙 완전 영구 박멸을 위한 DOM 직접 제어 Ref
  const guideBoxRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentBox = useRef({ x: 10, y: 10, width: 80, height: 80 });

  // localStorage에서 업로드된 이미지 리스트 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('wedding_builder_uploaded_images');
    if (saved) {
      try {
        setUploadedImages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse uploaded images', e);
      }
    }
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 이벤트를 통해 모달 열기 제어
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { currentValue: val, onSelect, inUseImages: inUse } = customEvent.detail || {};

      setCurrentValue(val);
      setOnSelectCallback(() => onSelect || null);

      // 사용 중인 이미지 수집
      if (inUse) {
        setInUseImages(inUse);
      } else {
        try {
          const sectionsStr = localStorage.getItem('wedding_builder_sections');
          if (sectionsStr) {
            const sections = JSON.parse(sectionsStr);
            const collected: string[] = [];
            sections.forEach((sec: any) => {
              if (sec.image) collected.push(sec.image);
              if (sec.image2) collected.push(sec.image2);
              if (sec.mobileImage) collected.push(sec.mobileImage);
              if (sec.mapImage) collected.push(sec.mapImage);
              if (sec.images && Array.isArray(sec.images)) {
                sec.images.forEach((img: any) => {
                  if (typeof img === 'string') collected.push(img);
                  else if (img && img.url) collected.push(img.url);
                });
              }
            });
            setInUseImages(collected);
          }
        } catch (err) {
          console.error(err);
        }
      }

      setSelectedTab('all');
      setSelectedImages([]); // 열릴 때 선택 초기화
      setIsOpen(true);
    };

    window.addEventListener('open-image-picker', handleOpen);
    return () => {
      window.removeEventListener('open-image-picker', handleOpen);
    };
  }, []);

  // 타이머 메모리 릭 방지
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  // 리액트 렌더링에 따른 현재 상자 오프셋 동기화 백업
  useEffect(() => {
    currentBox.current = cropBox;
  }, [cropBox]);

  // 이미지 업로드 수 제한 변경 사항 동기화 이벤트
  const updateLocalStorageAndNotify = (newImages: string[]) => {
    setUploadedImages(newImages);
    localStorage.setItem('wedding_builder_uploaded_images', JSON.stringify(newImages));

    window.dispatchEvent(new CustomEvent('uploaded-images-changed', {
      detail: { images: newImages }
    }));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 썸네일 클릭 시 토글 선택
  const handleToggleSelect = (url: string) => {
    if (selectedImages.includes(url)) {
      setSelectedImages(selectedImages.filter(img => img !== url));
    } else {
      setSelectedImages([...selectedImages, url]);
    }
  };

  // 전체 선택 토글
  const handleToggleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages([...filteredImages]);
    }
  };

  // 삭제 되돌리기 알림 호출 로직
  const triggerUndo = (prevList: string[]) => {
    setDeletedImagesBuffer(prevList);
    setIsUndoVisible(true);

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    undoTimeoutRef.current = setTimeout(() => {
      setIsUndoVisible(false);
      setDeletedImagesBuffer([]);
    }, 5000);
  };

  // 되돌리기 실행
  const handleUndoDelete = () => {
    if (deletedImagesBuffer.length > 0) {
      updateLocalStorageAndNotify(deletedImagesBuffer);
      setIsUndoVisible(false);
      setDeletedImagesBuffer([]);
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    }
  };

  // 썸네일 삭제
  const handleDeleteImage = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    // 백업 생성
    triggerUndo([...uploadedImages]);

    const filtered = uploadedImages.filter(img => img !== url);
    setSelectedImages(selectedImages.filter(img => img !== url));
    updateLocalStorageAndNotify(filtered);
  };

  // 툴바에서의 일괄 삭제
  const handleBulkDelete = () => {
    if (selectedImages.length === 0) return;
    // 백업 생성
    triggerUndo([...uploadedImages]);

    const filtered = uploadedImages.filter(img => !selectedImages.includes(img));
    updateLocalStorageAndNotify(filtered);
    setSelectedImages([]);
  };

  // 파일 업로드 처리
  const processFiles = (files: FileList) => {
    const remainingCount = 5 - uploadedImages.length;
    if (remainingCount <= 0) {
      alert('최대 5장까지 이미지를 업로드할 수 있습니다.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingCount);
    const promises = filesToUpload.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Urls => {
      const nextImages = [...uploadedImages, ...base64Urls].slice(0, 5);
      updateLocalStorageAndNotify(nextImages);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // 탭 필터링
  const getFilteredImages = () => {
    switch (selectedTab) {
      case 'inUse':
        return uploadedImages.filter(img => inUseImages.includes(img));
      case 'unused':
        return uploadedImages.filter(img => !inUseImages.includes(img));
      case 'all':
      default:
        return uploadedImages;
    }
  };

  const filteredImages = getFilteredImages();

  // 섹션 목록 가져오기 (localStorage의 청첩장 데이터 분석 - 오직 사진 전용 섹션만 정확히 필터링)
  const getAvailableSections = () => {
    try {
      const sectionsStr = localStorage.getItem('wedding_builder_sections');
      if (sectionsStr) {
        const sections: SectionItem[] = JSON.parse(sectionsStr);
        // 이미지가 사용되는 핵심 섹션(cover, gallery, map, photoDrop, intro)만 정교하게 필터링
        const validTypes = ['cover', 'gallery', 'map', 'photoDrop', 'intro'];
        const imageSections = sections.filter(sec => validTypes.includes(sec.type));

        // 각 타입별 총 개수 미리 계산
        const typeCounts: Record<string, number> = {};
        imageSections.forEach(sec => {
          typeCounts[sec.type] = (typeCounts[sec.type] || 0) + 1;
        });

        // 각 타입별 누적 렌더링 횟수 기록용 카운터
        const typeIndexes: Record<string, number> = {};
        const result: Array<{ id: string; type: string; label: string; isMulti: boolean; subType?: 'mobile' | 'desktop' }> = [];

        imageSections.forEach(sec => {
          typeIndexes[sec.type] = (typeIndexes[sec.type] || 0) + 1;
          const currentIdx = typeIndexes[sec.type];
          const totalCount = typeCounts[sec.type];

          // 2개 이상 중복 추가된 경우 뒤에 식별용 순번 접미사(예: - 1, - 2) 부여
          const suffix = totalCount > 1 ? ` - ${currentIdx}` : '';

          if (sec.type === 'cover') {
            // 스냅포스트 실물처럼 모바일과 데스크톱 두 개의 슬롯을 분할해서 리스트업
            result.push({
              id: sec.id,
              type: 'cover',
              label: '메인 이미지 - 모바일',
              isMulti: false,
              subType: 'mobile'
            });
            result.push({
              id: sec.id,
              type: 'cover',
              label: '메인 이미지 - 데스크톱',
              isMulti: false,
              subType: 'desktop'
            });
          } else if (sec.type === 'gallery') {
            const isGeneric = !sec.title || sec.title === '갤러리' || sec.title === '추가';
            result.push({
              id: sec.id,
              type: 'gallery',
              label: isGeneric ? `갤러리 (추가)${suffix}` : `갤러리 (${sec.title})${suffix}`,
              isMulti: true
            });
          } else if (sec.type === 'map') {
            result.push({
              id: sec.id,
              type: 'map',
              label: `위치/지도 - 커스텀 지도${suffix}`,
              isMulti: false
            });
          } else if (sec.type === 'photoDrop') {
            result.push({
              id: sec.id,
              type: 'photoDrop',
              label: `포토 드롭${suffix}`,
              isMulti: false
            });
          } else if (sec.type === 'intro') {
            const isGroom = sec.title && sec.title.includes('신랑');
            result.push({
              id: sec.id,
              type: 'intro',
              label: isGroom ? '신랑신부 소개 - 신랑' : '신랑신부 소개 - 신부',
              isMulti: false
            });
          }
        });

        return result;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const availableSections = getAvailableSections();

  // 선택한 이미지를 실제 섹션에 즉각 주입 (동기화)
  const handleApplyToSection = (sectionId: string, type: string, isMulti: boolean, subType?: 'mobile' | 'desktop') => {
    if (selectedImages.length === 0) return;

    try {
      const sectionsStr = localStorage.getItem('wedding_builder_sections');
      if (sectionsStr) {
        const sections: SectionItem[] = JSON.parse(sectionsStr);
        const updated = sections.map(sec => {
          if (sec.id === sectionId) {
            if (isMulti) {
              const existingImages = sec.images || [];
              const newFormatImages = selectedImages.map(url => {
                if (typeof url === 'string') return { url };
                return url;
              });
              return {
                ...sec,
                images: [...existingImages, ...newFormatImages]
              };
            } else {
              const targetUrl = selectedImages[0];
              if (type === 'cover') {
                if (subType === 'desktop') {
                  return { ...sec, image: targetUrl };
                } else {
                  return { ...sec, mobileImage: targetUrl };
                }
              } else if (type === 'map') {
                return { ...sec, mapImage: targetUrl, useMapApi: false };
              } else if (type === 'photoDrop') {
                return { ...sec, mobileImage: targetUrl };
              } else {
                return { ...sec, image: targetUrl };
              }
            }
          }
          return sec;
        });

        localStorage.setItem('wedding_builder_sections', JSON.stringify(updated));

        window.dispatchEvent(new CustomEvent('wedding_builder_sections_changed', {
          detail: { sections: updated }
        }));

        alert('선택하신 섹션에 이미지가 성공적으로 적용되었습니다.');
        setIsDropdownOpen(false);
        handleClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 편집 크로퍼 모달 띄우기 및 비율 초기화
  const handleOpenCropper = () => {
    if (selectedImages.length === 0) return;
    setCropperImage(selectedImages[0]);
    setCropRotate(0);
    setCropFlipH(false);
    setCropFlipV(false);
    setCropRatio('free');

    // 초기 크롭 박스 설정 (이미지 정중앙 배치)
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    setIsCropperOpen(true);
  };

  // 비율 설정에 따른 크롭 박스 규격 조정
  useEffect(() => {
    if (!isCropperOpen) return;

    if (cropRatio === 'free') {
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    } else {
      // 종횡비 매핑
      let ratioVal = 1;
      if (cropRatio === '1:1') ratioVal = 1;
      else if (cropRatio === '4:3') ratioVal = 4 / 3;
      else if (cropRatio === '16:9') ratioVal = 16 / 9;
      else if (cropRatio === '9:16') ratioVal = 9 / 16;

      // 이미지 컨테이너 규격 추종
      if (ratioVal >= 1) {
        const w = 70;
        const h = 70 / ratioVal;
        setCropBox({
          x: (100 - w) / 2,
          y: (100 - h) / 2,
          width: w,
          height: h
        });
      } else {
        const h = 70;
        const w = 70 * ratioVal;
        setCropBox({
          x: (100 - w) / 2,
          y: (100 - h) / 2,
          width: w,
          height: h
        });
      }
    }
  }, [cropRatio, isCropperOpen]);

  // 마우스/터치 드래그 & 리사이즈 전역 이벤트 핸들러 (Direct DOM 제어 공법 - 지연 시간 0ms, 초고속 Native 속도)
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!canvasWrapperRef.current) return;
      const rect = canvasWrapperRef.current.getBoundingClientRect();

      // 마우스 다운 시점의 픽셀 좌표 기준 완벽 1:1 오프셋 계산 (오차 0%)
      const dx = ((clientX - dragStart.current.x) / rect.width) * 100;
      const dy = ((clientY - dragStart.current.y) / rect.height) * 100;

      if (isDragging) {
        let newX = dragStart.current.boxX + dx;
        let newY = dragStart.current.boxY + dy;

        // 경계선 이탈 차단 (0% ~ 100% - 사진 내부에 가둠)
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + dragStart.current.boxW > 100) newX = 100 - dragStart.current.boxW;
        if (newY + dragStart.current.boxH > 100) newY = 100 - dragStart.current.boxH;

        // [최고 성능 최적화]: requestAnimationFrame 스케줄링을 통해 디스플레이 주사선에 맞춰 Native 스타일 주입
        if (guideBoxRef.current) {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = requestAnimationFrame(() => {
            if (guideBoxRef.current) {
              guideBoxRef.current.style.left = `${newX}%`;
              guideBoxRef.current.style.top = `${newY}%`;
            }
          });
        }

        // 마우스 업 시 백업할 실시간 가이드라인 크기 및 위치 추적 변수 갱신
        currentBox.current = {
          x: newX,
          y: newY,
          width: dragStart.current.boxW,
          height: dragStart.current.boxH
        };
      } else if (isResizing) {
        const handle = isResizing;
        let newX = dragStart.current.boxX;
        let newY = dragStart.current.boxY;
        let newW = dragStart.current.boxW;
        let newH = dragStart.current.boxH;

        if (cropRatio === 'free') {
          // [자유 크롭] 8개 조작 장치별 계산식
          if (handle === 'tl') {
            const possibleW = dragStart.current.boxW - dx;
            const possibleH = dragStart.current.boxH - dy;
            if (possibleW > 15 && dragStart.current.boxX + dx >= 0) {
              newX = dragStart.current.boxX + dx;
              newW = possibleW;
            }
            if (possibleH > 15 && dragStart.current.boxY + dy >= 0) {
              newY = dragStart.current.boxY + dy;
              newH = possibleH;
            }
          } else if (handle === 'tr') {
            const possibleW = dragStart.current.boxW + dx;
            const possibleH = dragStart.current.boxH - dy;
            if (possibleW > 15 && dragStart.current.boxX + possibleW <= 100) {
              newW = possibleW;
            }
            if (possibleH > 15 && dragStart.current.boxY + dy >= 0) {
              newY = dragStart.current.boxY + dy;
              newH = possibleH;
            }
          } else if (handle === 'bl') {
            const possibleW = dragStart.current.boxW - dx;
            const possibleH = dragStart.current.boxH + dy;
            if (possibleW > 15 && dragStart.current.boxX + dx >= 0) {
              newX = dragStart.current.boxX + dx;
              newW = possibleW;
            }
            if (possibleH > 15 && dragStart.current.boxY + possibleH <= 100) {
              newH = possibleH;
            }
          } else if (handle === 'br') {
            const possibleW = dragStart.current.boxW + dx;
            const possibleH = dragStart.current.boxH + dy;
            if (possibleW > 15 && dragStart.current.boxX + possibleW <= 100) {
              newW = possibleW;
            }
            if (possibleH > 15 && dragStart.current.boxY + possibleH <= 100) {
              newH = possibleH;
            }
          } else if (handle === 'tc') {
            const possibleH = dragStart.current.boxH - dy;
            if (possibleH > 15 && dragStart.current.boxY + dy >= 0) {
              newY = dragStart.current.boxY + dy;
              newH = possibleH;
            }
          } else if (handle === 'bc') {
            const possibleH = dragStart.current.boxH + dy;
            if (possibleH > 15 && dragStart.current.boxY + possibleH <= 100) {
              newH = possibleH;
            }
          } else if (handle === 'lc') {
            const possibleW = dragStart.current.boxW - dx;
            if (possibleW > 15 && dragStart.current.boxX + dx >= 0) {
              newX = dragStart.current.boxX + dx;
              newW = possibleW;
            }
          } else if (handle === 'rc') {
            const possibleW = dragStart.current.boxW + dx;
            if (possibleW > 15 && dragStart.current.boxX + possibleW <= 100) {
              newW = possibleW;
            }
          }
        } else {
          // [종횡비 고정 크롭] 8개 조작 장치 비례 연산 매칭 (피그마식 비례 대칭 조절)
          let ratioVal = 1;
          if (cropRatio === '1:1') ratioVal = 1;
          else if (cropRatio === '4:3') ratioVal = 4 / 3;
          else if (cropRatio === '16:9') ratioVal = 16 / 9;
          else if (cropRatio === '9:16') ratioVal = 9 / 16;

          if (['tl', 'tr', 'bl', 'br'].includes(handle)) {
            let delta = dx;
            if (handle === 'tl' || handle === 'bl') {
              delta = -dx;
            }

            let targetW = dragStart.current.boxW + delta;
            let targetH = targetW / ratioVal;

            if (targetW > 15 && targetH > 15) {
              if (handle === 'br') {
                if (dragStart.current.boxX + targetW <= 100 && dragStart.current.boxY + targetH <= 100) {
                  newW = targetW;
                  newH = targetH;
                }
              } else if (handle === 'tr') {
                const diffH = targetH - dragStart.current.boxH;
                if (dragStart.current.boxX + targetW <= 100 && dragStart.current.boxY - diffH >= 0) {
                  newW = targetW;
                  newH = targetH;
                  newY = dragStart.current.boxY - diffH;
                }
              } else if (handle === 'bl') {
                const diffW = targetW - dragStart.current.boxW;
                if (dragStart.current.boxX - diffW >= 0 && dragStart.current.boxY + targetH <= 100) {
                  newW = targetW;
                  newH = targetH;
                  newX = dragStart.current.boxX - diffW;
                }
              } else if (handle === 'tl') {
                const diffW = targetW - dragStart.current.boxW;
                const diffH = targetH - dragStart.current.boxH;
                if (dragStart.current.boxX - diffW >= 0 && dragStart.current.boxY - diffH >= 0) {
                  newW = targetW;
                  newH = targetH;
                  newX = dragStart.current.boxX - diffW;
                  newY = dragStart.current.boxY - diffH;
                }
              }
            }
          } else {
            // 변 중앙 조절 시 양단 대칭 비례 확장식 탑재
            if (handle === 'tc') {
              const deltaH = -dy;
              const targetH = dragStart.current.boxH + deltaH;
              const targetW = targetH * ratioVal;
              const diffW = targetW - dragStart.current.boxW;

              if (targetH > 15 && targetW > 15 && dragStart.current.boxY - deltaH >= 0 && dragStart.current.boxX - diffW / 2 >= 0 && dragStart.current.boxX - diffW / 2 + targetW <= 100) {
                newH = targetH;
                newW = targetW;
                newY = dragStart.current.boxY - deltaH;
                newX = dragStart.current.boxX - diffW / 2;
              }
            } else if (handle === 'bc') {
              const deltaH = dy;
              const targetH = dragStart.current.boxH + deltaH;
              const targetW = targetH * ratioVal;
              const diffW = targetW - dragStart.current.boxW;

              if (targetH > 15 && targetW > 15 && dragStart.current.boxY + targetH <= 100 && dragStart.current.boxX - diffW / 2 >= 0 && dragStart.current.boxX - diffW / 2 + targetW <= 100) {
                newH = targetH;
                newW = targetW;
                newX = dragStart.current.boxX - diffW / 2;
              }
            } else if (handle === 'lc') {
              const deltaW = -dx;
              const targetW = dragStart.current.boxW + deltaW;
              const targetH = targetW / ratioVal;
              const diffH = targetH - dragStart.current.boxH;

              if (targetW > 15 && targetH > 15 && dragStart.current.boxX - deltaW >= 0 && dragStart.current.boxY - diffH / 2 >= 0 && dragStart.current.boxY - diffH / 2 + targetH <= 100) {
                newW = targetW;
                newH = targetH;
                newX = dragStart.current.boxX - deltaW;
                newY = dragStart.current.boxY - diffH / 2;
              }
            } else if (handle === 'rc') {
              const deltaW = dx;
              const targetW = dragStart.current.boxW + deltaW;
              const targetH = targetW / ratioVal;
              const diffH = targetH - dragStart.current.boxH;

              if (targetW > 15 && targetH > 15 && dragStart.current.boxX + targetW <= 100 && dragStart.current.boxY - diffH / 2 >= 0 && dragStart.current.boxY - diffH / 2 + targetH <= 100) {
                newW = targetW;
                newH = targetH;
                newY = dragStart.current.boxY - diffH / 2;
              }
            }
          }
        }

        // [최고 성능 최적화]: 리렌더링 차단 후 스타일을 실시간으로 DOM에 직접 주입 (이동 및 리사이징 초정밀 Native 반영)
        if (guideBoxRef.current) {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = requestAnimationFrame(() => {
            if (guideBoxRef.current) {
              guideBoxRef.current.style.left = `${newX}%`;
              guideBoxRef.current.style.top = `${newY}%`;
              guideBoxRef.current.style.width = `${newW}%`;
              guideBoxRef.current.style.height = `${newH}%`;
            }
          });
        }

        currentBox.current = {
          x: newX,
          y: newY,
          width: newW,
          height: newH
        };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging && !isResizing) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // 마우스를 놓았을 때(mouseup / touchend) 딱 한 번 리액트 상태와 완벽 동기화
    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(null);

      // 드래그/리사이즈 조작이 끝난 최종 시점에 단 한 번 상태를 굳혀 리액트와 완벽 동화
      setCropBox({
        x: currentBox.current.x,
        y: currentBox.current.y,
        width: currentBox.current.width,
        height: currentBox.current.height
      });
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, isResizing, cropRatio]);

  // 마우스 다운 트리거 등록
  const startDrag = (e: React.MouseEvent, handle: string | null, clientX: number, clientY: number) => {
    e.preventDefault();
    e.stopPropagation();

    dragStart.current = {
      x: clientX,
      y: clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height
    };

    if (handle) {
      setIsResizing(handle);
    } else {
      setIsDragging(true);
    }
  };

  // Canvas 드로잉 및 회전/반전/크롭 알고리즘 구현 (500x500 고정 및 찌부러짐 전혀 없는 Cover 공식 적용)
  useEffect(() => {
    if (!isCropperOpen || !cropperImage || !cropperCanvasRef.current) return;

    const canvas = cropperCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 캔버스 크기를 웰 가로세로 규격(500 x 500)에 완전히 1:1로 꽉 채움 선언
      canvas.width = 500;
      canvas.height = 500;

      ctx.clearRect(0, 0, 500, 500);
      ctx.save();

      // 중심 정렬 변환
      ctx.translate(500 / 2, 500 / 2);

      // 대칭 반전 변환
      const scaleH = cropFlipH ? -1 : 1;
      const scaleV = cropFlipV ? -1 : 1;
      ctx.scale(scaleH, scaleV);

      // 회전 변환
      ctx.rotate((cropRotate * Math.PI) / 180);

      const is90or270 = cropRotate === 90 || cropRotate === 270;
      let scale = 1;

      if (is90or270) {
        // 90도/270도 회전 시 원본의 가로가 세로(500)에 매핑되고 원본의 세로가 가로(500)에 매핑되므로 
        // 찌부러짐 없이 가득 채우는 Cover 스케일은 다음과 같음
        scale = Math.max(500 / img.height, 500 / img.width);
      } else {
        // 0도/180도 회전 시
        scale = Math.max(500 / img.width, 500 / img.height);
      }

      const drawW = img.width * scale;
      const drawH = img.height * scale;

      // 회전 전의 순수 이미지 좌표계 기준으로 중심 렌더링 드로잉
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };
    img.src = cropperImage;
  }, [isCropperOpen, cropperImage, cropRotate, cropFlipH, cropFlipV]);

  // 편집 결과 실제 영역 크롭 알고리즘 연동 및 저장
  const handleSaveCrop = () => {
    if (!cropperCanvasRef.current) return;

    const canvas = cropperCanvasRef.current;

    // 사용자가 지정한 가이드 영역의 퍼센트(cropBox)를 픽셀 단위로 변환 (500 x 500 기준 정확한 오프셋)
    const cropX = (cropBox.x / 100) * canvas.width;
    const cropY = (cropBox.y / 100) * canvas.height;
    const cropW = (cropBox.width / 100) * canvas.width;
    const cropH = (cropBox.height / 100) * canvas.height;

    // 예외 제어 (최소 5픽셀)
    if (cropW < 5 || cropH < 5) {
      alert('크롭 영역이 너무 작습니다.');
      return;
    }

    // 임시 캔버스를 만들어 해당 영역만 정밀하게 잘라내기(Crop)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      alert('크롭 처리에 실패했습니다.');
      return;
    }

    // 원본 캔버스에서 잘라낸 영역을 새 캔버스에 1:1 드로잉
    tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const croppedUrl = tempCanvas.toDataURL('image/jpeg', 0.9);

    // 업로드 목록의 기존 원본 이미지를 크롭된 새 이미지로 교체
    const updated = uploadedImages.map(img => img === cropperImage ? croppedUrl : img);
    updateLocalStorageAndNotify(updated);

    // 선택 목록도 업데이트
    setSelectedImages(selectedImages.map(img => img === cropperImage ? croppedUrl : img));

    setIsCropperOpen(false);
    setCropperImage(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 5초 삭제 취소(되돌리기) 알약 토스트 렌더링 - 상단 중앙 완벽 플로팅 */}
      {isUndoVisible && (
        <div className="undo-toast animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="undo-toast-body">
            <span className="undo-toast-text">이미지가 삭제되었습니다.</span>
            <button className="btn-undo-action" onClick={handleUndoDelete}>
              되돌리기
            </button>
          </div>
        </div>
      )}

      <div className="image-picker-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="image-picker-container" onClick={(e) => e.stopPropagation()}>

          {/* 모달 헤더 */}
          <div className="picker-header">
            <div className="picker-title-block">
              <h3 className="picker-title">
                <Camera size={18} className="text-[#3b82f6]" />
                이미지 관리
              </h3>
              <span className="picker-subtitle">사용할 이미지를 선택하세요</span>
            </div>
            <button className="btn-picker-close" onClick={handleClose}>
              <X size={16} />
            </button>
          </div>

          {/* 파일 업로드 드래그 앤 드롭 영역 */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
          />
          <div
            className={`upload-drag-area ${dragActive ? 'drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-icon-container">
              <Upload size={20} />
            </div>
            <div className="upload-text-block">
              <span className="upload-primary-text">여기에 이미지를 드래그하거나 클릭하세요</span>
              <span className="upload-secondary-text">여러 파일을 한 번에 선택할 수 있습니다</span>
              {uploadedImages.length >= 5 && (
                <span className="upload-limit-warning text-[11px] font-bold text-[#ef4444] mt-1 block">
                  이미지 제한에 도달했습니다
                </span>
              )}
            </div>
          </div>

          {/* 선명하게 토글 배너 */}
          <div className="sharpen-toggle-banner">
            <div className="sharpen-label-container">
              <div className="sharpen-icon-badge">
                <Sparkles size={16} />
              </div>
              <div className="sharpen-text-wrapper">
                <span className="sharpen-title">선명하게</span>
                <span className="sharpen-desc">윤곽을 또렷하게</span>
              </div>
            </div>
            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={sharpen}
                onChange={(e) => setSharpen(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* 탭 바 */}
          <div className="picker-tabs-row">
            <div className="picker-tabs-container">
              <button
                className={`picker-tab-button ${selectedTab === 'all' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('all')}
              >
                전체
              </button>
              <button
                className={`picker-tab-button ${selectedTab === 'inUse' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('inUse')}
              >
                사용 중
              </button>
              <button
                className={`picker-tab-button ${selectedTab === 'unused' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('unused')}
              >
                미사용
              </button>
            </div>
            <span className="picker-counter">
              {uploadedImages.length}/5 이미지
            </span>
          </div>

          {/* 이미지 목록 스크롤 영역 */}
          <div className="picker-content-scroll">
            {filteredImages.length === 0 ? (
              <div className="picker-empty-state">
                <div className="empty-icon-badge">
                  <ImageIcon size={28} />
                </div>
                <div className="empty-text-block">
                  <span className="empty-primary-text">사진을 추가해보세요</span>
                  <span className="empty-secondary-text">
                    {selectedTab === 'all'
                      ? '위 영역에 이미지를 드래그하거나 클릭하여 업로드하세요'
                      : selectedTab === 'inUse'
                        ? '사용 중인 사진이 없습니다'
                        : '미사용 사진이 없습니다'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="picker-image-grid">
                {filteredImages.map((img, idx) => {
                  const isSelected = selectedImages.includes(img);
                  const isInUse = inUseImages.includes(img);
                  return (
                    <div
                      key={idx}
                      className={`picker-image-item ${isSelected ? 'image-selected' : ''} ${sharpen ? 'sharpen-applied' : ''}`}
                      onClick={() => {
                        handleToggleSelect(img);
                        if (onSelectCallback) {
                          onSelectCallback(img);
                          handleClose();
                        }
                      }}
                      onDoubleClick={() => {
                        if (onSelectCallback) {
                          onSelectCallback(img);
                          handleClose();
                        }
                      }}
                    >
                      <img src={img} className="picker-thumbnail" alt="" />

                      {/* 선택 시 체크 뱃지 */}
                      {isSelected && (
                        <span className="picker-select-badge">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}

                      {/* 호버 액션 - 삭제 버튼 */}
                      <div className="picker-item-actions">
                        <button
                          className="btn-picker-delete"
                          onClick={(e) => handleDeleteImage(e, img)}
                          title="삭제"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>

                      {/* 사용 중 표시 배지 */}
                      {isInUse && (
                        <span className="in-use-badge">사용 중</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 하단 제어부 */}
          <div className="picker-footer flex items-center justify-between mt-2 pt-2 border-t border-[#f1f5f9]">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-[12px] font-bold text-[#475569] hover:text-[#0f172a] transition-colors"
            >
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] font-bold transition-colors ${selectedImages.length === filteredImages.length && filteredImages.length > 0 ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-[#cbd5e1] bg-white text-transparent'}`}>
                ✓
              </span>
              전체 선택
            </button>

            {selectedImages.length > 0 && (
              <span className="picker-select-count">
                {selectedImages.length}장 선택
              </span>
            )}
          </div>

          {/* 스냅포스트 스타일의 고급 하단 조작 툴바 (선택된 파일이 있을 때 활성화) */}
          {selectedImages.length > 0 && (
            <div className="picker-bottom-toolbar">
              <div className="picker-toolbar-actions">
                {/* ✂ 편집 버튼 */}
                <button
                  onClick={handleOpenCropper}
                  className="btn-toolbar-action"
                >
                  <Crop size={14} className="text-[#475569]" />
                  편집
                </button>

                {/* 섹션에 적용 드롭다운 단추 */}
                <div className="dropdown-container" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="btn-toolbar-action"
                  >
                    섹션에 적용
                    <ChevronDown size={12} className="text-[#475569]" />
                  </button>

                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      {availableSections.length === 0 ? (
                        <div className="p-3 text-[10px] text-center text-slate-400 font-semibold">적용할 수 있는 섹션이 없습니다.</div>
                      ) : (
                        availableSections.map((sec, i) => (
                          <button
                            key={i}
                            className="dropdown-item"
                            onClick={() => handleApplyToSection(sec.id, sec.type, sec.isMulti, sec.subType)}
                          >
                            <span className="dropdown-item-title">{sec.label}</span>
                            <span className={`dropdown-item-badge ${sec.isMulti ? 'multi' : ''}`}>
                              {sec.isMulti ? '다중' : '1장'}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* 삭제 버튼 제거 완료 */}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* HTML5 Canvas 기반의 회전/대칭/비율 조절 및 드래그 앤 리사이즈 크로퍼 모달 */}
      {isCropperOpen && cropperImage && (
        <div className="cropper-overlay" onClick={() => setIsCropperOpen(false)}>
          <div className="cropper-container" onClick={(e) => e.stopPropagation()}>

            <div className="cropper-header">
              <h4 className="cropper-title">이미지 편집</h4>
              <button className="btn-picker-close" onClick={() => setIsCropperOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* 회전 및 반전 조작 행 - 아이콘 매핑 적용으로 완성도 극대화 */}
            <div className="cropper-toolbar-row">
              <div className="cropper-tool-group">
                <button
                  className="btn-crop-tool"
                  onClick={() => setCropRotate((cropRotate - 90 + 360) % 360)}
                >
                  <RotateCcw size={12} />
                  왼쪽
                </button>
                <button
                  className="btn-crop-tool"
                  onClick={() => setCropRotate((cropRotate + 90) % 360)}
                >
                  <RotateCw size={12} />
                  오른쪽
                </button>
              </div>
              <span className="cropper-divider">|</span>
              <div className="cropper-tool-group">
                <button
                  className={`btn-crop-tool ${cropFlipH ? 'tool-active' : ''}`}
                  onClick={() => setCropFlipH(!cropFlipH)}
                >
                  <FlipHorizontal size={12} />
                  좌우
                </button>
                <button
                  className={`btn-crop-tool ${cropFlipV ? 'tool-active' : ''}`}
                  onClick={() => setCropFlipV(!cropFlipV)}
                >
                  <FlipVertical size={12} />
                  상하
                </button>
              </div>
            </div>

            {/* 비율 조절 탭 */}
            <div className="cropper-ratio-bar">
              {(['free', '1:1', '4:3', '16:9', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  className={`btn-ratio-tab ${cropRatio === ratio ? 'ratio-active' : ''}`}
                  onClick={() => setCropRatio(ratio)}
                >
                  {ratio === 'free' ? '자유' : ratio}
                </button>
              ))}
            </div>

            {/* 인터랙티브 조작이 완벽 지원되는 크롭 캔버스 박스 */}
            <div
              ref={previewBoxRef}
              className="cropper-preview-box"
            >
              {/* [해당영역 꽉 채운 캔버스]: 스냅포스트 실치수 1:1에 완벽 수렴하는 500px x 500px 웰 공간 고정 */}
              <div
                ref={canvasWrapperRef}
                className="cropper-canvas-wrapper"
                style={{
                  position: 'relative',
                  width: '500px',
                  height: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <canvas ref={cropperCanvasRef} className="cropper-canvas" style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '1 / 1', display: 'block' }} />

                {/* 드래그 및 리사이징 마우스 이벤트가 바인딩된 가이드라인 박스 (상하좌우 틈새 없는 500x500 캔버스 영역 내에 칼같이 가둠) */}
                <div
                  ref={guideBoxRef}
                  className="cropper-guide-box"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => startDrag(e, null, e.clientX, e.clientY)}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) {
                      startDrag(e as any, null, e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                >
                  {/* 시계방향 점선 흐름 애니메이션용 SVG 오버레이 */}
                  <svg className="cropper-marching-ants" width="100%" height="100%">
                    <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="6, 4" />
                  </svg>

                  {/* 8각 리사이즈 핸들 조작 단추 (배경 투명 & 흰색 얇은 보더) */}
                  <span
                    className="cropper-handle tl"
                    onMouseDown={(e) => startDrag(e, 'tl', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'tl', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle tc"
                    onMouseDown={(e) => startDrag(e, 'tc', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'tc', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle tr"
                    onMouseDown={(e) => startDrag(e, 'tr', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'tr', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle lc"
                    onMouseDown={(e) => startDrag(e, 'lc', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'lc', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle rc"
                    onMouseDown={(e) => startDrag(e, 'rc', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'rc', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle bl"
                    onMouseDown={(e) => startDrag(e, 'bl', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'bl', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle bc"
                    onMouseDown={(e) => startDrag(e, 'bc', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'bc', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                  <span
                    className="cropper-handle br"
                    onMouseDown={(e) => startDrag(e, 'br', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        startDrag(e as any, 'br', e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                  ></span>
                </div>
              </div>
            </div>

            {/* 하단 조절 행 */}
            <div className="cropper-footer">
              <button
                className="btn-crop-cancel"
                onClick={() => setIsCropperOpen(false)}
              >
                취소
              </button>
              <button
                className="btn-crop-submit"
                onClick={handleSaveCrop}
              >
                <Scissors size={12} strokeWidth={3} />
                적용
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
