import { useEffect, useRef } from 'react';

interface AnimationConfig {
  selector?: string;
  ref?: React.RefObject<HTMLElement>;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useAnimateOnScroll(configs: AnimationConfig[]) {
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    configs.forEach((config) => {
      let element: HTMLElement | null = null;

      if (config.ref?.current) {
        element = config.ref.current;
      } else if (config.selector) {
        element = document.querySelector(config.selector);
      }

      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                target.classList.add(config.className || 'show');
                
                if (config.once !== false) {
                  observer.unobserve(target);
                }
              } else {
                if (config.once === false) {
                  const target = entry.target as HTMLElement;
                  target.classList.remove(config.className || 'show');
                }
              }
            });
          },
          {
            threshold: config.threshold || 0.3,
            rootMargin: config.rootMargin || '0px'
          }
        );

        observer.observe(element);
        observers.push(observer);
      }
    });

    observersRef.current = observers;

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [configs]);

  return observersRef;
}