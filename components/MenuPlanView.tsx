
import React from 'react';
import { ContentContainer } from './FocusView';

const MenuPlanView: React.FC = () => {
    // This component can be a simple fallback or return null if slideshow is always present
    return (
        <ContentContainer key="menu-plan" imageUrl="/assets/Speiseplan.jpg">
            {/* The text overlay has been removed as per user request */}
        </ContentContainer>
    );
};

export default MenuPlanView;