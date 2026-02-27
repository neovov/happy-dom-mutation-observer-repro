import {useEffect, useLayoutEffect, useRef, useState} from 'react';

const FakeDropdown = () => {
	const [open, setOpen] = useState(false);
	return (
		<div>
			<button onClick={() => setOpen((o) => !o)}>Open dropdown</button>
			{open && <div data-dropdown>Dropdown content</div>}
		</div>
	);
};

export const Component = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dropdownElement, setDropdownElement] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!dropdownElement) return;

		const observer = new MutationObserver(() => {
			// Handle mutation (e.g., recompute dropdown position)
		});
		observer.observe(dropdownElement, {attributes: true});

		return () => observer.disconnect();
	}, [dropdownElement]);

	// Capture a child element reference after mount
	useLayoutEffect(() => {
		const element = containerRef.current?.querySelector('[data-dropdown]');
		setDropdownElement(element as HTMLElement | null);
	}, []);

	return (
		<div ref={containerRef}>
			<FakeDropdown />
		</div>
	);
};
