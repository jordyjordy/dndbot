import React from 'react';
import { render, screen } from '@testing-library/react';
import { DraggableList } from '.';

interface Item {
    id: string
}

const testList = [
    {
        id: 'a',
    },
];

interface TestTemplateProps {
    item: Item
}

const TestTemplate = ({ item }: TestTemplateProps): JSX.Element => (
    <div>
        test
    </div>
);

it('renders without props', () => {
    render(<DraggableList list={testList} itemKey="id" template={TestTemplate} />);
    expect(screen.getByText('test')).toBeInTheDocument();
});
