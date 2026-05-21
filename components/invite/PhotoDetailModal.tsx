'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, MessageCircle, Eye, User, Send, CornerDownRight, Lock, Trash2, Edit2, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface PhotoDetailModalProps {
  image: any;
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
}

export default function PhotoDetailModal({ image, isOpen, onClose, invitationId }: PhotoDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [viewCount, setViewCount] = useState(image?.view_count || 0);
  const [likesCount, setLikesCount] = useState(image?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [password, setPassword] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [passwordPrompt, setPasswordPrompt] = useState<{ type: 'edit'|'delete', commentId: string } | null>(null);
  const [promptPassword, setPromptPassword] = useState('');
  
  const [hasSavedSettings, setHasSavedSettings] = useState(false);
  const [isChangingSettings, setIsChangingSettings] = useState(false);

  // Custom Alert / Confirm Modal States
  const [customAlert, setCustomAlert] = useState<{ title?: string; message: string; type?: 'error'|'info'|'success' } | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{ title?: string; message: string; onConfirm: () => void } | null>(null);

  const showAlert = (message: string, type: 'error'|'info'|'success' = 'info', title?: string) => {
    setCustomAlert({ message, type, title });
  };

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
    setCustomConfirm({ message, onConfirm, title });
  };

  const getClientId = () => {
    if (typeof window === 'undefined') return 'mock-client';
    let id = localStorage.getItem('photo_drop_client_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('photo_drop_client_id', id);
    }
    return id;
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      
      const clientId = getClientId();
      setIsLiked(image?.likedByClients?.includes(clientId) || false);
      setViewCount(image?.view_count || 0);
      setLikesCount(image?.likesCount || 0);
      
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('photo_drop_author_name');
        const savedPw = localStorage.getItem('photo_drop_author_pw');
        if (savedName) setAuthorName(savedName);
        if (savedPw) {
          setPassword(savedPw);
          setHasSavedSettings(true);
        }
      }

      if (image?.id && !image.id.toString().startsWith('local_')) {
        fetch(`/api/photo-drop/images/${image.id}/view`, { method: 'POST' })
          .then(res => res.json())
          .then(data => { if (data.success) setViewCount(data.viewCount); })
          .catch(err => console.error('Error incrementing view:', err));

        fetch(`/api/photo-drop/images/${image.id}/comments`)
          .then(res => res.json())
          .then(data => { if (data.comments) setComments(data.comments); })
          .catch(err => console.error('Error fetching comments:', err));
      } else {
        setComments([]);
      }
    } else {
      setIsVisible(false);
      setReplyTo(null);
      setEditingId(null);
      setPasswordPrompt(null);
      setIsChangingSettings(false);
      setCustomAlert(null);
      setCustomConfirm(null);
    }
  }, [isOpen, image]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const handleLike = async () => {
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prev => prev + (prevLiked ? -1 : 1));

    if (image?.id && !image.id.toString().startsWith('local_')) {
      try {
        await fetch(`/api/photo-drop/images/${image.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: getClientId() })
        });
      } catch (err) {
        setIsLiked(prevLiked);
        setLikesCount(prev => prev + (prevLiked ? 1 : -1));
      }
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    
    const nameToUse = authorName.trim() || '하객';
    if (typeof window !== 'undefined') {
      localStorage.setItem('photo_drop_author_name', nameToUse);
      if (password) localStorage.setItem('photo_drop_author_pw', password);
    }

    const tempId = 'temp_' + Date.now();
    const newCmt = {
      id: tempId,
      parent_id: replyTo,
      author_name: nameToUse,
      content: newComment,
      created_at: new Date().toISOString(),
      client_id: getClientId(),
      likesCount: 0,
      likedByClients: []
    };
    
    setComments(prev => [...prev, newCmt]);
    const commentText = newComment;
    setNewComment('');
    setReplyTo(null);
    setHasSavedSettings(true);
    setIsChangingSettings(false);

    if (image?.id && !image.id.toString().startsWith('local_')) {
      try {
        const res = await fetch(`/api/photo-drop/images/${image.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: replyTo,
            authorName: nameToUse,
            content: commentText,
            clientId: getClientId(),
            password: password || null
          })
        });
        const data = await res.json();
        
        if (!res.ok) {
          showAlert(data.error, 'error', '안내');
          setComments(prev => prev.filter(c => c.id !== tempId));
          setNewComment(commentText);
          return;
        }

        if (data.comment) {
          setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: data.comment.id } : c));
        }
      } catch (err) {
        console.error('Error adding comment:', err);
      }
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    const clientId = getClientId();
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const isLiked = c.likedByClients?.includes(clientId);
        return {
          ...c,
          likesCount: c.likesCount + (isLiked ? -1 : 1),
          likedByClients: isLiked ? c.likedByClients.filter((id: string) => id !== clientId) : [...(c.likedByClients || []), clientId]
        };
      }
      return c;
    }));

    if (!commentId.toString().startsWith('temp_') && !commentId.toString().startsWith('local_')) {
      try {
        await fetch(`/api/photo-drop/comments/${commentId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId })
        });
      } catch (err) {
        console.error('Error toggling comment like:', err);
      }
    }
  };

  const executeDelete = async (commentId: string, pwd?: string) => {
    const clientId = getClientId();
    const isClientMatch = comments.find(c => c.id === commentId)?.client_id === clientId;
    
    // Save original for rollback
    const commentToRollback = comments.find(c => c.id === commentId);
    
    // Optimistic UI update
    setComments(prev => prev.filter(c => c.id !== commentId));
    setPasswordPrompt(null);
    
    // If it's a local preview image, don't send API request
    if (image?.id && image.id.toString().startsWith('local_')) {
      return;
    }
    
    try {
      let endpoint = `/api/photo-drop/comments/${commentId}`;
      if (isClientMatch && !pwd) endpoint += `?clientId=${clientId}`;
      else endpoint += `?password=${pwd}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch(err: any) {
      // Rollback
      if (commentToRollback) {
        setComments(prev => {
          const restored = [...prev, commentToRollback].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          // Ensure uniqueness just in case
          return Array.from(new Map(restored.map(item => [item.id, item])).values());
        });
      }
      
      let errorMsg = err.message || '비밀번호가 일치하지 않습니다.';
      if (errorMsg.includes('fetch failed') || errorMsg.includes('Failed to fetch')) {
        errorMsg = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      showAlert(errorMsg, 'error', '오류');
    }
  };

  const handleAction = (type: 'edit' | 'delete', commentId: string, pwd?: string) => {
    const clientId = getClientId();
    const isClientMatch = comments.find(c => c.id === commentId)?.client_id === clientId;
    
    // If it's the same device and no prompt is active, try directly
    if (isClientMatch && !pwd && !passwordPrompt) {
      if (type === 'delete') {
        showConfirm('댓글을 삭제하시겠습니까?', () => executeDelete(commentId), '댓글 삭제');
      } else {
        setEditingId(commentId);
        setEditContent(comments.find(c => c.id === commentId)?.content || '');
      }
      return;
    }

    // Need password
    if (!pwd) {
      setPasswordPrompt({ type, commentId });
      setPromptPassword('');
      return;
    }

    // Process with password
    if (type === 'delete') {
      executeDelete(commentId, pwd);
    } else {
      setEditingId(commentId);
      setEditContent(comments.find(c => c.id === commentId)?.content || '');
    }
  };

  const submitEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    const pwd = passwordPrompt?.commentId === commentId ? promptPassword : password;
    const clientId = getClientId();
    
    const commentToRollback = comments.find(c => c.id === commentId);
    
    // Optimistic UI update
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editContent } : c));
    setEditingId(null);
    setPasswordPrompt(null);
    
    // If it's a local preview image, don't send API request
    if (image?.id && image.id.toString().startsWith('local_')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/photo-drop/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, clientId, password: pwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch(err: any) {
      // Rollback
      if (commentToRollback) {
        setComments(prev => prev.map(c => c.id === commentId ? commentToRollback : c));
      }
      showAlert(err.message || '수정 권한이 없거나 금칙어가 포함되어 있습니다.', 'error', '수정 실패');
    }
  };

  const executeReport = async (commentId: string) => {
    // If it's a local preview image, just show success directly
    if (image?.id && image.id.toString().startsWith('local_')) {
      showAlert('신고가 정상적으로 접수되었습니다.', 'success', '신고 접수 완료');
      return;
    }

    try {
      const res = await fetch(`/api/photo-drop/comments/${commentId}/report`, { method: 'POST' });
      const data = await res.json();
      if (data.isHidden) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        showAlert('신고가 누적되어 해당 댓글이 자동으로 숨김 처리되었습니다.', 'success', '신고 접수 완료');
      } else {
        showAlert('신고가 정상적으로 접수되었습니다.', 'success', '신고 접수 완료');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reportComment = (commentId: string) => {
    showConfirm(
      '이 댓글을 신고하시겠습니까?\n누적 신고 접수 시 자동으로 숨김 처리됩니다.', 
      () => executeReport(commentId),
      '댓글 신고'
    );
  };

  if (!isOpen) return null;

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const renderComment = (comment: any, isReply = false) => {
    const isMine = comment.client_id === getClientId();
    const isEditing = editingId === comment.id;
    const isPrompting = passwordPrompt?.commentId === comment.id;

    return (
      <div key={comment.id} className={`flex gap-2.5 ${isReply ? 'mt-3 pl-11' : ''} group`}>
        {isReply && <CornerDownRight size={14} className="text-stone-300 mt-2 shrink-0" />}
        {!isReply && (
          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
            <User size={16} className="text-stone-400" />
          </div>
        )}
        <div className={`flex-1 ${isReply ? 'bg-white p-3 rounded-2xl border border-stone-100 shadow-sm' : ''}`}>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-stone-800">{comment.author_name}</span>
              <span className="text-[11px] text-stone-400">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            
            {/* Hover Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isMine ? (
                <>
                  <button onClick={() => handleAction('edit', comment.id)} className="text-[11px] text-stone-400 hover:text-stone-700 font-medium flex items-center gap-0.5"><Edit2 size={10} />수정</button>
                  <button onClick={() => handleAction('delete', comment.id)} className="text-[11px] text-stone-400 hover:text-rose-500 font-medium flex items-center gap-0.5"><Trash2 size={10} />삭제</button>
                </>
              ) : (
                <button onClick={() => reportComment(comment.id)} className="text-[11px] text-stone-400 hover:text-rose-500 font-medium flex items-center gap-0.5"><AlertCircle size={10} />신고</button>
              )}
            </div>
          </div>

          {isPrompting ? (
            <div className="mt-2 mb-2 flex flex-col gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-[11px] text-stone-500 font-medium">다른 기기에서 작성된 댓글입니다. 비밀번호를 입력해주세요.</span>
              <div className="flex items-center gap-2">
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="숫자 4자리" 
                  value={promptPassword}
                  onChange={e => setPromptPassword(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-[13px] tracking-widest text-center outline-none focus:border-stone-300" 
                />
                <button onClick={() => handleAction(passwordPrompt.type, passwordPrompt.commentId, promptPassword)} className="px-3 py-1.5 bg-stone-800 text-white text-[12px] rounded-lg font-bold">확인</button>
                <button onClick={() => setPasswordPrompt(null)} className="px-3 py-1.5 bg-stone-200 text-stone-600 text-[12px] rounded-lg font-bold">취소</button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="mt-2 mb-2 flex items-center gap-2">
              <input 
                type="text" 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                className="flex-1 bg-stone-100 px-3 py-1.5 rounded-lg text-[13px] outline-none" 
                onKeyDown={e => e.key === 'Enter' && submitEdit(comment.id)}
              />
              <button onClick={() => submitEdit(comment.id)} className="px-3 py-1.5 bg-stone-800 text-white text-[12px] rounded-lg">확인</button>
              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-stone-200 text-stone-600 text-[12px] rounded-lg">취소</button>
            </div>
          ) : (
            <p className="text-[14px] text-stone-700 leading-relaxed mb-2 break-keep">{comment.content}</p>
          )}

          <div className="flex items-center gap-4">
            {!isReply && <button onClick={() => setReplyTo(comment.id)} className="text-[12px] font-bold text-stone-400 hover:text-stone-600">답글 달기</button>}
            <button onClick={() => toggleCommentLike(comment.id)} className="flex items-center gap-1 group/like">
              <Heart size={12} className={comment.likedByClients?.includes(getClientId()) ? 'fill-rose-400 text-rose-400' : 'text-stone-300 group-hover/like:text-rose-300'} />
              <span className={`text-[12px] font-bold ${comment.likedByClients?.includes(getClientId()) ? 'text-rose-400' : 'text-stone-400'}`}>{comment.likesCount > 0 ? comment.likesCount : ''}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center font-sans">
      <div 
        className={`absolute inset-0 bg-black/90 transition-opacity duration-400 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose} 
      />

      {/* Custom Alert/Confirm Modals */}
      {(customAlert || customConfirm) && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] animate-fade-in" onClick={() => { setCustomAlert(null); setCustomConfirm(null); }} />
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-[320px] rounded-3xl shadow-2xl p-6 relative z-10 animate-scale-up border border-white flex flex-col items-center text-center">
            
            {customAlert?.type === 'error' ? (
              <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
            ) : customAlert?.type === 'success' ? (
              <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mb-4">
                <Info size={24} />
              </div>
            )}

            <h3 className="text-[17px] font-bold text-stone-800 mb-2">
              {customAlert?.title || customConfirm?.title || '안내'}
            </h3>
            <p className="text-[14px] text-stone-600 leading-relaxed mb-6 break-keep whitespace-pre-line">
              {customAlert?.message || customConfirm?.message}
            </p>

            <div className="flex w-full gap-2">
              {customConfirm && (
                <button 
                  onClick={() => setCustomConfirm(null)} 
                  className="flex-1 py-3.5 bg-stone-100 text-stone-600 rounded-xl font-bold text-[14px] hover:bg-stone-200 transition-colors"
                >
                  취소
                </button>
              )}
              <button 
                onClick={() => {
                  if (customConfirm) {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  } else {
                    setCustomAlert(null);
                  }
                }} 
                className={`flex-1 py-3.5 text-white rounded-xl font-bold text-[14px] shadow-sm transition-transform active:scale-95 ${customAlert?.type === 'error' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-stone-800 hover:bg-stone-900'}`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`relative w-full max-w-md h-[90vh] max-h-[850px] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-400 transform ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'} mt-auto sm:mt-0`}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-stone-100 shrink-0 bg-white z-10">
          <span className="text-[14px] font-bold text-stone-800">사진 상세</span>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50">
          <div className="w-full bg-black flex items-center justify-center">
            <img src={image?.url} className="w-full max-h-[60vh] object-contain" alt="Photo Detail" />
          </div>

          <div className="bg-white px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className="flex items-center gap-1.5 group">
                <Heart size={22} className={`transition-colors ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400 group-hover:text-rose-400'}`} />
                <span className={`text-[13.5px] font-bold ${isLiked ? 'text-rose-500' : 'text-stone-600'}`}>{likesCount}</span>
              </button>
              <div className="flex items-center gap-1.5 text-stone-400">
                <MessageCircle size={22} />
                <span className="text-[13.5px] font-bold text-stone-600">{comments.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <Eye size={18} />
              <span className="text-[12.5px] font-medium">{viewCount}명 읽음</span>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-6">
            {rootComments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-stone-400">첫 번째 댓글을 남겨보세요!</p>
              </div>
            ) : (
              rootComments.map(comment => (
                <div key={comment.id} className="flex flex-col gap-3">
                  {renderComment(comment)}
                  {getReplies(comment.id).map(reply => renderComment(reply, true))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 bg-white border-t border-stone-100 p-4 pb-safe flex flex-col gap-3 relative z-20">
          {replyTo && (
            <div className="absolute -top-10 left-0 w-full h-10 bg-stone-50 border-t border-stone-100 flex items-center justify-between px-5">
              <span className="text-[12px] text-stone-500 font-medium"><strong className="text-stone-700">{comments.find(c => c.id === replyTo)?.author_name}</strong>님에게 답글 남기는 중</span>
              <button onClick={() => setReplyTo(null)} className="text-[12px] text-stone-400 font-bold hover:text-stone-600">취소</button>
            </div>
          )}
          
          {(!hasSavedSettings || isChangingSettings) ? (
            <div className="flex gap-2 animate-fade-in">
              <input 
                type="text" 
                placeholder="이름" 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-24 px-3 py-2.5 bg-stone-100 rounded-xl text-[13px] font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200" 
              />
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={12} />
                </div>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="비밀번호 4자리" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-100 rounded-xl text-[13px] font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 tracking-widest" 
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-1 mb-1 animate-fade-in">
              <span className="text-[12px] text-stone-500 font-medium">작성자: <strong className="text-stone-700">{authorName}</strong></span>
              <button onClick={() => setIsChangingSettings(true)} className="text-[11px] text-stone-400 hover:text-stone-600 underline underline-offset-2">정보 변경</button>
            </div>
          )}

          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="따뜻한 한마디를 남겨주세요..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              className="w-full pl-4 pr-10 py-2.5 bg-stone-100 rounded-xl text-[13px] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200" 
            />
            <button 
              onClick={submitComment}
              disabled={!newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-stone-800 text-white rounded-full disabled:bg-stone-300 disabled:text-stone-100 transition-colors"
            >
              <Send size={12} className="ml-[-1px] mt-[1px]" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
