import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatItem } from '../../../components/common/StatItem';

describe('StatItem', () => {
  it('should render correctly and match snapshot', () => {
    const testIcon = React.createElement('div', { 'data-testid': 'stat-icon' }, '📊');

    const { container, getByTestId } = render(
      React.createElement(StatItem, {
        icon: testIcon,
        label: "Active Users",
        value: "1,234"
      })
    );

    expect(getByTestId('stat-icon')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should display the correct label and value', () => {
    const testIcon = React.createElement('div', null, '📊');

    const { getByText } = render(
      React.createElement(StatItem, {
        icon: testIcon,
        label: "Active Users",
        value: "1,234"
      })
    );

    expect(getByText("Active Users")).toBeInTheDocument();
    expect(getByText("1,234")).toBeInTheDocument();
  });

  it('should properly handle different props', () => {
    const testIcon = React.createElement('div', null, '💰');

    const { getByText } = render(
      React.createElement(StatItem, {
        icon: testIcon,
        label: "Monthly Revenue",
        value: "$45,678"
      })
    );

    expect(getByText("Monthly Revenue")).toBeInTheDocument();
    expect(getByText("$45,678")).toBeInTheDocument();
  });

  it('should maintain proper styling', () => {
    const testIcon = React.createElement('div', null, '📊');

    const { container } = render(
      React.createElement(StatItem, {
        icon: testIcon,
        label: "Active Users",
        value: "1,234"
      })
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('flex');
    expect(mainDiv.className).toContain('items-center');
    expect(mainDiv.className).toContain('gap-2');

    const labelElement = screen.getByText('Active Users');
    expect(labelElement.className).toContain('text-xs');
    expect(labelElement.className).toContain('text-gray-600');

    const valueElement = screen.getByText('1,234');
    expect(valueElement.className).toContain('text-sm');
    expect(valueElement.className).toContain('font-medium');
  });
});