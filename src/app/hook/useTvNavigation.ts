import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useTVNavigation() {
  useEffect(() => {
    // Tenta focar no primeiro elemento válido ao carregar a tela, se nada estiver focado
    const focusInitial = () => {
      if (!document.activeElement || document.activeElement === document.body) {
        const firstFocusable = document.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    };
    
    // Pequeno delay para garantir que os elementos renderizaram
    setTimeout(focusInitial, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      
      // Mapeia botões de Ok do controle remoto que às vezes mandam códigos diferentes
      const isOkKey = e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13 || e.key === 'MediaPlayPause';
      
      if (!keys.includes(e.key) && !isOkKey) return;

      const activeElement = document.activeElement as HTMLElement;

      if (isOkKey) {
        // Enter nativo já clica em botões e foca inputs, mas se for uma div/li com tabindex, forçamos o click
        if (activeElement && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON' && activeElement.tagName !== 'A') {
          e.preventDefault();
          activeElement.click();
        }
        return;
      }

      // Impede a rolagem padrão da página com as setas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const focusableElements = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
      if (focusableElements.length === 0) return;

      if (!activeElement || activeElement === document.body) {
        focusableElements[0].focus();
        return;
      }

      const activeRect = activeElement.getBoundingClientRect();
      let bestMatch: HTMLElement | null = null;
      let minDistance = Number.MAX_VALUE;

      focusableElements.forEach((el) => {
        if (el === activeElement) return;

        const rect = el.getBoundingClientRect();
        // Ignora elementos ocultos
        if (rect.width === 0 || rect.height === 0 || rect.top < 0 && rect.bottom < 0) return;

        let isDirectionalMatch = false;

        const center1 = { x: activeRect.left + activeRect.width / 2, y: activeRect.top + activeRect.height / 2 };
        const center2 = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        switch (e.key) {
          case 'ArrowLeft':
            isDirectionalMatch = center2.x < center1.x;
            break;
          case 'ArrowRight':
            isDirectionalMatch = center2.x > center1.x;
            break;
          case 'ArrowUp':
            isDirectionalMatch = center2.y < center1.y;
            break;
          case 'ArrowDown':
            isDirectionalMatch = center2.y > center1.y;
            break;
        }

        if (isDirectionalMatch) {
          const dx = center1.x - center2.x;
          const dy = center1.y - center2.y;
          
          // Peso maior no eixo secundário para dar preferência a elementos na mesma linha/coluna (navegação em grade)
          let weightedDistance;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            weightedDistance = Math.abs(dx) + Math.abs(dy) * 5;
          } else {
            weightedDistance = Math.abs(dy) + Math.abs(dx) * 5;
          }

          if (weightedDistance < minDistance) {
            minDistance = weightedDistance;
            bestMatch = el;
          }
        }
      });

      if (bestMatch) {
        (bestMatch as HTMLElement).focus();
        // Garante que o elemento ficará visível na tela
        (bestMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
