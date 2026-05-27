'use client';
import useInView from '@/hooks/useInView';

/**
 * Wraps children so they fade-and-rise into view the first time the
 * section enters the viewport. Set `delay` (ms) to stagger neighbours.
 */
export default function AnimatedSection({
    children,
    delay = 0,
    className = '',
    as: Tag = 'div',
    distance = 24,
}) {
    const [ref, inView] = useInView();

    const style = {
        transitionDelay: `${delay}ms`,
        transform: inView ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
        opacity:   inView ? 1 : 0,
    };

    return (
        <Tag
            ref={ref}
            style={style}
            className={`transition-all duration-700 ease-out will-change-transform ${className}`}
        >
            {children}
        </Tag>
    );
}
