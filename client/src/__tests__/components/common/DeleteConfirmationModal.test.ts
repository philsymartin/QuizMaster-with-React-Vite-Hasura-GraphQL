import React from 'react';
import { render } from '@testing-library/react';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

describe("DeleteConfirmationModal", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      React.createElement(DeleteConfirmationModal, {
        isOpen: false,
        onClose: () => {},
        onConfirm: () => {}
      })
    );

    expect(container.firstChild).toBeNull();
  });
  
  it("should match snapshot with default props", () => {
    const { container } = render(
      React.createElement(DeleteConfirmationModal, {
        isOpen: true,
        onClose: () => {},
        onConfirm: () => {}
      })
    );
    
    expect(container).toMatchSnapshot();
  });
  
  it("should show loading state when isLoading is true", () => {
    const { container } = render(
      React.createElement(DeleteConfirmationModal, {
        isOpen: true,
        onClose: () => {},
        onConfirm: () => {},
        isLoading: true
      })
    );
    
    expect(container).toMatchSnapshot();
  });
});