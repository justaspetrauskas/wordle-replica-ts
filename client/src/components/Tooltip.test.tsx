import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

const EXPLANATION = 'The word is drawn from this theme.';

function renderTooltip() {
  return render(<Tooltip label="Category help">{EXPLANATION}</Tooltip>);
}

const backdrop = () =>
  screen.getByRole('tooltip').previousElementSibling as HTMLElement;

describe('Tooltip', () => {
  it('opens the explanation from the help button', async () => {
    const user = userEvent.setup();
    renderTooltip();

    expect(screen.queryByText(EXPLANATION)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Category help' }));

    expect(screen.getByText(EXPLANATION)).toBeInTheDocument();
  });

  it('closes when the backdrop behind it is pressed', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.click(screen.getByRole('button', { name: 'Category help' }));
    await user.click(backdrop());

    expect(screen.queryByText(EXPLANATION)).not.toBeInTheDocument();
  });

  it('stays open when the explanation itself is pressed', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.click(screen.getByRole('button', { name: 'Category help' }));
    await user.click(screen.getByText(EXPLANATION));

    expect(screen.getByText(EXPLANATION)).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.click(screen.getByRole('button', { name: 'Category help' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByText(EXPLANATION)).not.toBeInTheDocument();
  });
});
