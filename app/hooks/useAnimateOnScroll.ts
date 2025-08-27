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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const config = configs.find(config => {
              if (config.ref?.current) {
                return config.ref.current === target;
              }
              if (config.selector) {
                return target.matches(config.selector);
              }
              return false;
            });

            if (config) {
              target.classList.add(config.className || 'show');
              
              if (config.once !== false) {
                observer.unobserve(target);
              }
            }
          } else {
            const target = entry.target as HTMLElement;
            const config = configs.find(config => {
              if (config.ref?.current) {
                return config.ref.current === target;
              }
              if (config.selector) {
                return target.matches(config.selector);
              }
              return false;
            });

            if (config && config.once === false) {
              target.classList.remove(config.className || 'show');
            }
          }
        });
      },
      {
        threshold: configs[0]?.threshold || 0.3,
        rootMargin: configs[0]?.rootMargin || '0px'
      }
    );

    observerRef.current = observer;

    configs.forEach((config) => {
      let element: HTMLElement | null = null;

      if (config.ref?.current) {
        element = config.ref.current;
      } else if (config.selector) {
        element = document.querySelector(config.selector);
      }

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [configs]);

  return observerRef;
}