import '@testing-library/jest-dom/vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {Component} from './Component';

/**
 * This test hangs with happy-dom >= 20.3.3 because:
 *
 * 1. happy-dom 20.3.3 changed MutationObserver callbacks from
 *    `setTimeout` (macrotask) to `queueMicrotask` (microtask)
 *
 * 2. @testing-library/dom's `waitFor` / `findBy*` use MutationObserver
 *    to detect DOM changes
 *
 * 3. When fake timers are active, the MutationObserver microtask callback
 *    creates a tight loop with React's act() — mutations trigger microtasks
 *    which trigger more React work which triggers more mutations, never
 *    yielding to the event loop
 *
 * With happy-dom < 20.3.3, the MutationObserver used setTimeout (a macrotask
 * controlled by fake timers), so act() could properly schedule and flush work.
 */
describe('with fake timers', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
	});

	it('should not hang', async () => {
		const user = userEvent.setup();
		render(<Component />);

		const button = screen.getByRole('button', {name: 'Open dropdown'});
		await user.click(button);

		expect(screen.getByText('Dropdown content')).toBeInTheDocument();
	});
});

describe('without fake timers', () => {
	afterEach(() => cleanup());

	it('works', async () => {
		const user = userEvent.setup();
		render(<Component />);

		const button = screen.getByRole('button', {name: 'Open dropdown'});
		await user.click(button);

		expect(screen.getByText('Dropdown content')).toBeInTheDocument();
	});
});
