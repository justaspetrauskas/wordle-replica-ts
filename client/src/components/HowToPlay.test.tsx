import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HowToPlay } from './HowToPlay';

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'How to play' }));
};

const backdrop = () => screen.getByRole('dialog').previousElementSibling as HTMLElement;

describe('HowToPlay', () => {
  it('stays closed until the trigger is pressed', () => {
    render(<HowToPlay />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('states the objective once opened', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    expect(screen.getByText('Guess one hidden 5-letter word in 6 tries.')).toBeInTheDocument();
  });

  it('tells the player to read across', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    expect(screen.getByText('Always read across.')).toBeInTheDocument();
  });

  it('says a row is a whole word and that across is the only direction', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    expect(
      screen.getByText(/Every row is one whole word, left to right/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/across is the only direction that ever spells anything/)
    ).toBeInTheDocument();
  });

  it('says which direction letters are typed in', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    expect(screen.getByText(/from left to right/)).toBeInTheDocument();
  });

  it('explains all three tile colours', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    expect(screen.getByText('Olive — in the word, in this exact spot.')).toBeInTheDocument();
    expect(screen.getByText('Ochre — in the word, but somewhere else.')).toBeInTheDocument();
    expect(screen.getByText('Navy — not in the word at all.')).toBeInTheDocument();
  });

  it('closes when the backdrop behind it is pressed', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    await user.click(backdrop());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    await open(user);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
