/**
 * js/cart.js — VARO 쇼핑몰 장바구니 페이지 기능 고도화
 * 
 * - App.Cart 모듈 연동
 * - 수량 조절, 삭제, 전체 선택 기능
 * - 배송비 및 총액 실시간 계산
 * - 쿠폰(VARO10) 할인 로직 적용
 */

// Utils는 utils.js에서 window.Utils로 전역 할당됨

document.addEventListener('click', (e) => {
  const btn = e.target.closest('#cartDeleteSelected');
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const checkboxes = Array.from(document.querySelectorAll('.item-checkbox'));
  const indicesToRemove = checkboxes
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.dataset.index))
    .sort((a, b) => b - a);

  if (indicesToRemove.length === 0) {
    if (window.Utils?.showToast) window.Utils.showToast('삭제할 상품을 선택해 주세요.', 'error');
    else alert('삭제할 상품을 선택해 주세요.');
    return;
  }

  const showCustomConfirm = (message, onConfirm) => {
    const modal = document.createElement('div');
    modal.className = 'varo-modal-overlay';
    modal.innerHTML = `
      <div class="varo-modal-content">
        <p class="varo-modal-text">${message}</p>
        <div class="varo-modal-btns">
          <button type="button" id="confirmCancel" class="varo-modal-btn varo-modal-btn--cancel">취소</button>
          <button type="button" id="confirmOk" class="varo-modal-btn varo-modal-btn--confirm">확인</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmOk').onclick = () => {
      modal.remove();
      onConfirm();
    };
    modal.querySelector('#confirmCancel').onclick = () => {
      modal.remove();
    };
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  };

  showCustomConfirm('선택한 상품을 삭제하시겠습니까?', () => {
    window.App.Cart.removeSelected(indicesToRemove);
    location.reload();
  });
}, true);

const CartPage = (() => {
  const { VARO_CONFIG } = window;

  const state = {
    discountRate: 0,
    appliedCoupon: null
  };

  let refs = {};

  const init = () => {
    refs = {
      list: document.getElementById('cartList'),
      empty: document.getElementById('cartEmpty'),
      layout: document.getElementById('cartLayout'),

      // Summary
      prodTotal: document.getElementById('summaryProductTotal'),
      shipping: document.getElementById('summaryShipping'),
      discount: document.getElementById('summaryDiscount'),
      discountRow: document.getElementById('discountRow'),
      finalTotal: document.getElementById('summaryFinalTotal'),

      // Tools
      checkAll: document.getElementById('cartCheckAll'),
      deleteSelected: document.getElementById('cartDeleteSelected'),
      checkoutBtn: document.getElementById('cartCheckout'),

      // Coupon
      couponInput: document.getElementById('couponInput'),
      applyCoupon: document.getElementById('applyCoupon'),
      couponMsg: document.getElementById('couponMessage'),

      // Free Shipping Progress
      freeShipBar: document.getElementById('freeShipBar'),
      freeShipText: document.getElementById('freeShipText'),

      // Empty state recommends
      emptyRecommend: document.getElementById('emptyRecommendGrid'),
    };

    if (!refs.list) return;
    render();
    bindEvents();
  };


  const render = () => {
    const items = window.App?.Cart.getItems() || [];

    if (items.length === 0) {
      refs.empty.style.display = 'block';
      refs.layout.style.display = 'none';
      renderRecommendations();
      return;
    }

    refs.empty.style.display = 'none';
    refs.layout.style.display = 'grid';

    // 리스트 렌더링 (New Trendy Structure)
    refs.list.innerHTML = items.map((item, idx) => `
      <li class="cart-item" data-index="${idx}">
        <div class="cart-item__check">
          <input type="checkbox" checked class="item-checkbox" data-index="${idx}">
        </div>
        <img class="cart-item__img" src="${item.mainImg}" alt="${item.name}" onclick="location.href='./product.html?id=${item.productId}'">
        <div class="cart-item__info">
          <h3 class="cart-item__name">${item.name}</h3>
          <p class="cart-item__option">OPTION: ${item.color} / ${item.size}</p>
          <div class="cart-item__qty">
            <div class="qty-control">
              <button data-action="minus" data-index="${idx}">-</button>
              <span>${item.qty}</span>
              <button data-action="plus" data-index="${idx}">+</button>
            </div>
            <button type="button" class="cart-item__remove btn-text" data-index="${idx}">삭제</button>
          </div>
        </div>
        <div class="cart-item__price-block">
          <span class="cart-item__price">${Utils.formatPrice(item.price * item.qty)}</span>
        </div>
      </li>
    `).join('');

    updateSummary();
  };

  const renderRecommendations = () => {
    if (!refs.emptyRecommend) return;
    const { PRODUCTS } = window.VARO_DATA;
    // 베스트 상품 4개 추천
    const bests = PRODUCTS.filter(p => p.badge === 'best').slice(0, 4);
    refs.emptyRecommend.innerHTML = bests.map(p => `
      <article class="product-card" onclick="location.href='./product.html?id=${p.id}'">
        <div class="product-card__img-wrap">
          <img src="${p.mainImg}" alt="${p.name}" class="product-card__img" loading="lazy">
        </div>
        <div class="product-card__info">
          <h4 class="product-card__name">${p.name}</h4>
          <p class="product-card__price">${Utils.formatPrice(p.salePrice ?? p.price)}</p>
        </div>
      </article>
    `).join('');
  };

  const updateSummary = () => {
    const items = window.App?.Cart.getItems() || [];
    const subtotal = items.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);

    // 유저 등급 확인 및 혜택 계산
    const user = JSON.parse(localStorage.getItem('varo_user') || '{}');
    let gradeDiscountRate = 0;
    let isFreeShippingByGrade = false;

    if (user.grade === 'DIA') {
      gradeDiscountRate = 0.15;
      isFreeShippingByGrade = true;
    } else if (user.grade === 'GOLD') {
      gradeDiscountRate = 0.1;
      isFreeShippingByGrade = true;
    } else if (user.grade === 'SILVER') {
      gradeDiscountRate = 0.05;
    }

    // 쿠폰 할인과 등급 할인 중 더 높은 혜택 적용
    const finalDiscountRate = Math.max(state.discountRate, gradeDiscountRate);

    let shipping = subtotal >= VARO_CONFIG.FREE_SHIP_THRESHOLD ? 0 : VARO_CONFIG.DELIVERY_FEE;
    if (isFreeShippingByGrade) {
      shipping = 0; // 등급 혜택으로 무료배송
    }

    const discount = Math.floor(subtotal * finalDiscountRate);
    const total = subtotal - discount + shipping;

    refs.prodTotal.textContent = Utils.formatPrice(subtotal);
    refs.shipping.textContent = shipping === 0 ? '무료' : Utils.formatPrice(shipping);

    if (discount > 0) {
      refs.discountRow.style.display = 'flex';
      refs.discount.textContent = `-${Utils.formatPrice(discount)}`;

      if (gradeDiscountRate > 0 && finalDiscountRate === gradeDiscountRate && refs.couponMsg) {
        refs.couponMsg.textContent = `[${user.grade}] 등급 혜택 ${gradeDiscountRate * 100}% 할인 적용 중`;
        refs.couponMsg.className = 'coupon-message success';
        refs.couponMsg.hidden = false;
      }
    } else {
      refs.discountRow.style.display = 'none';
    }

    refs.finalTotal.textContent = Utils.formatPrice(total);

    // 무료배송 진행 바 업데이트
    const progress = isFreeShippingByGrade ? 100 : Math.min((subtotal / VARO_CONFIG.FREE_SHIP_THRESHOLD) * 100, 100);
    refs.freeShipBar.style.width = `${progress}%`;
    if (isFreeShippingByGrade || subtotal >= VARO_CONFIG.FREE_SHIP_THRESHOLD) {
      refs.freeShipText.textContent = isFreeShippingByGrade ? `[${user.grade}] 등급 무료배송 혜택 적용 중!` : '현재 무료배송 혜택을 받고 있습니다!';
    } else {
      const remaining = VARO_CONFIG.FREE_SHIP_THRESHOLD - subtotal;
      refs.freeShipText.textContent = `${Utils.formatPrice(remaining)}원 추가 시 무료배송`;
    }
  };

  const bindEvents = () => {
    // 수량 조절 및 삭제 (이벤트 위임)
    refs.list.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const index = parseInt(btn.dataset.index);

      if (btn.dataset.action === 'plus' || btn.dataset.action === 'minus') {
        const delta = btn.dataset.action === 'plus' ? 1 : -1;
        window.App.Cart.updateQty(index, delta);
        render();
      }

      if (btn.classList.contains('cart-item__remove')) {
        window.App.Cart.removeItem(index);
        render();
      }
    });

    // 전체 선택
    refs.checkAll?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      refs.list.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = checked);
    });

    // 선택 삭제 (전역 리스너로 통합됨)

    // 쿠폰 적용
    refs.applyCoupon?.addEventListener('click', () => {
      const code = refs.couponInput.value.trim().toUpperCase();
      if (code === 'VARO10') {
        state.discountRate = 0.1;
        state.appliedCoupon = code;
        refs.couponMsg.innerHTML = '10% 할인이 적용되었습니다. <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-flex; vertical-align: middle; margin-left: 4px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
        refs.couponMsg.className = 'coupon-message success';
        refs.couponMsg.hidden = false;
        updateSummary();
        Utils.showToast('쿠폰이 정상적으로 적용되었습니다.');
      } else {
        Utils.showToast('유효하지 않은 쿠폰 코드입니다.', 'error');
      }
    });

    // 주문하기 (PortOne 실결제 연동)
    refs.checkoutBtn?.addEventListener('click', () => {
      const items = window.App?.Cart.getItems() || [];
      if (items.length === 0) {
        Utils.showToast('장바구니가 비어 있습니다.', 'error');
        return;
      }

      const totalAmount = parseInt(document.getElementById('summaryFinalTotal').textContent.replace(/[^0-9]/g, ''));
      const orderName = items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`;

      // 1. PortOne 객체 초기화 (상용에서는 실제 가맹점 식별코드 사용)
      const IMP = window.IMP;
      if (!IMP) {
        Utils.showToast('결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        return;
      }

      // 테스트 식별코드 (imp00000000 등 포트원 공용 테스트 ID 적용)
      IMP.init('imp14397622');

      // 2. 결제창 호출
      const user = JSON.parse(localStorage.getItem('varo_user') || '{}');
      const addresses = JSON.parse(localStorage.getItem('varo_addresses') || '[]');
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0] || {};

      Utils.showToast('결제 창으로 이동합니다.', 'success');

      IMP.request_pay({
        pg: 'tosspayments',           // 테스트용 토스페이먼츠
        pay_method: 'card',           // 카드 결제
        merchant_uid: 'VARO_ORDER_' + new Date().getTime(),
        name: orderName,
        amount: totalAmount,
        buyer_email: user.email || '',
        buyer_name: user.name || '',
        buyer_tel: user.phone || '010-0000-0000',
        buyer_addr: defaultAddr.address ? `${defaultAddr.address} ${defaultAddr.address_detail || ''}`.trim() : '배송지 정보 없음',
        buyer_postcode: defaultAddr.zipcode || '00000'
      }, function (rsp) {
        if (rsp.success) {
          // 결제 성공 로직
          Utils.showToast('결제가 성공적으로 완료되었습니다!', 'success');
          window.App.Cart.clear();
          setTimeout(() => {
            location.href = './index.html';
          }, 1500);
        } else {
          // 결제 취소/실패 로직
          Utils.showToast(`결제가 취소되었습니다. (${rsp.error_msg})`, 'error');
        }
      });
    });
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', CartPage.init);

