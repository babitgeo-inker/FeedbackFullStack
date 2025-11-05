import React, { useState, useEffect } from 'react';

// API configuration
const API_BASE_URL = 'http://localhost:8080/api';

// TypeScript interface for feedback data
interface FeedbackData {
  id: number;
  userPhone: string;
  name: string;
  feedback: string;
  profileImageUrl?: string;
  whatsappImageId?: string;
  imageStoragePath?: string;
  sessionDuration?: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch feedback data from backend API
const fetchFeedbackData = async (): Promise<FeedbackData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result.data);
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    throw error;
  }
};

// No fallback data - only use real API data

interface ProfileBubbleProps {
  position: { x: number; y: number };
  photoUrl: string;
  size: number;
  isCentral?: boolean;
  index: number;
  name: string;
  feedback: string;
}

const ProfileBubble: React.FC<ProfileBubbleProps> = ({ position, photoUrl, size, isCentral = false, index, name, feedback }) => {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Calculate sizes based on bubble size - profile picture, name, and feedback
  const profilePicSize = isCentral ? size * 0.45 : size * 0.5; // Reduced to make room for name
  const nameHeight = isCentral ? 20 : 16; // Space for name display
  const remainingSpace = size - profilePicSize - nameHeight - (isCentral ? 20 : 16); // Padding
  const feedbackHeight = Math.max(remainingSpace, isCentral ? 24 : 20); // Minimum height for feedback

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isCentral 
          ? '0 20px 60px rgba(0,0,0,0.3), 0 0 0 8px rgba(255,255,255,0.9)' 
          : '0 10px 30px rgba(0,0,0,0.2), 0 0 0 4px rgba(255,255,255,0.7)',
        border: isCentral ? '6px solid #fff' : '3px solid #fff',
        zIndex: isCentral ? 1000 : 100 + index,
        animation: `float-${index % 3} 3s ease-in-out infinite`,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isCentral ? '8px' : '4px', // Further reduced padding for maximum profile pic space
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Profile Picture Section */}
      <div
        style={{
          width: `${profilePicSize}px`,
          height: `${profilePicSize}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          marginBottom: isCentral ? '6px' : '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '2px solid rgba(255,255,255,0.8)',
        }}
      >
        <img
          src={photoUrl}
          alt={`Profile of ${name}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=400`;
          }}
        />
        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '8px'
          }}>
            Loading...
          </div>
        )}
      </div>

      {/* Name Section */}
      <div
        style={{
          height: `${nameHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginBottom: isCentral ? '4px' : '3px',
          padding: '0 4px',
        }}
      >
        <span
          style={{
            fontSize: isCentral ? '12px' : size > 80 ? '10px' : '8px',
            fontWeight: '700',
            color: '#2563eb', // Blue color to match the theme
            lineHeight: '1.1',
            textShadow: '0 1px 2px rgba(255,255,255,0.9)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {name}
        </span>
      </div>

      {/* Feedback Text Section */}
      <div
        style={{
          height: `${feedbackHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 6px',
        }}
      >
        <span
          style={{
            fontSize: isCentral ? '11px' : size > 80 ? '9px' : '8px', // Slightly reduced to fit with name
            fontWeight: '600',
            color: '#333',
            lineHeight: '1.2',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: isCentral ? 2 : 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {feedback}
        </span>
      </div>
    </div>
  );
};

interface NetworkLinesProps {
  bubblePositions: Array<{ x: number; y: number }>;
}

const NetworkLines: React.FC<NetworkLinesProps> = ({ bubblePositions }) => {
  const connections = React.useMemo(() => {
    const lines: Array<[number, number]> = [];
    const centralIndex = bubblePositions.length - 1; // Last bubble is central

    // Connect each small bubble to more adjacent neighbors for denser network
    bubblePositions.forEach((pos, i) => {
      if (i === centralIndex) return; // Skip central bubble

      // Calculate distances to other bubbles (excluding central)
      const distances = bubblePositions
        .map((otherPos, j) => ({
          index: j,
          distance: Math.sqrt(
            Math.pow(pos.x - otherPos.x, 2) +
            Math.pow(pos.y - otherPos.y, 2)
          )
        }))
        .filter(d => d.index !== i && d.index !== centralIndex) // Exclude self and central
        .sort((a, b) => a.distance - b.distance);

      // Connect to 4-6 nearest neighbors for denser network
      const connectionsCount = Math.min(6, distances.length);
      for (let j = 0; j < connectionsCount; j++) {
        const targetIndex = distances[j].index;
        if (i < targetIndex) { // Avoid duplicate lines
          lines.push([i, targetIndex]);
        }
      }
    });

    // Add some connections from outer bubbles to central bubble for radial effect
    const outerBubbles = bubblePositions.slice(0, -1); // All except central
    
    // Connect some outer bubbles to center (every 8th bubble for clean look)
    outerBubbles.forEach((_, i) => {
      if (i % 8 === 0) { // Every 8th bubble connects to center
        lines.push([i, centralIndex]);
      }
    });

    return lines;
  }, [bubblePositions]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {connections.map(([startIdx, endIdx], i) => {
        const start = bubblePositions[startIdx];
        const end = bubblePositions[endIdx];
        
        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))',
            }}
          />
        );
      })}
    </svg>
  );
};

interface ProfileGalleryProps {
  onBubbleCountChange: (count: number) => void;
  feedbackData: FeedbackData[];
  isLoading: boolean;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ onBubbleCountChange, feedbackData, isLoading }) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generate bubble positions in 2D based on window size and real data
  const bubblePositions = React.useMemo(() => {
    if (containerSize.width === 0 || feedbackData.length === 0) return [];

    const positions: Array<{ x: number; y: number }> = [];
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    // Use only actual feedback data count
    const totalBubbles = feedbackData.length;
    
    if (totalBubbles === 0) return positions;

    // Create positions array with center position at index 0
    const tempPositions: Array<{ x: number; y: number }> = [];
    
    // Index 0 (first feedback) goes to center
    tempPositions.push({ x: centerX, y: centerY });
    
    if (totalBubbles > 1) {
      // Arrange remaining bubbles (index 1 onwards) in concentric circles
      const maxRadius = Math.min(containerSize.width, containerSize.height) * 0.4;
      const remainingBubbles = totalBubbles - 1;
      let bubblesPlaced = 0;
      let currentRadius = maxRadius * 0.3;
      
      while (bubblesPlaced < remainingBubbles) {
        const bubblesInThisCircle = Math.min(
          Math.floor(2 * Math.PI * currentRadius / 120), // Space bubbles 120px apart
          remainingBubbles - bubblesPlaced
        );
        
        for (let i = 0; i < bubblesInThisCircle && bubblesPlaced < remainingBubbles; i++) {
          const angle = (i / bubblesInThisCircle) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;
          
          // Ensure bubble is within screen bounds
          const margin = 60;
          if (x > margin && x < containerSize.width - margin && 
              y > margin && y < containerSize.height - margin) {
            tempPositions.push({ x, y });
            bubblesPlaced++;
          }
        }
        
        currentRadius += 150; // Move to next circle
        if (currentRadius > maxRadius) break;
      }
      
      // If we still have bubbles to place, scatter them randomly
      while (bubblesPlaced < remainingBubbles) {
        const x = Math.random() * (containerSize.width - 120) + 60;
        const y = Math.random() * (containerSize.height - 120) + 60;
        
        // Ensure minimum distance from center
        const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distanceFromCenter > 80) {
          tempPositions.push({ x, y });
          bubblesPlaced++;
        }
      }
    }
    
    // Return positions array where index 0 is center
    return tempPositions;
    
    return positions;
  }, [containerSize, feedbackData]);

  // Update bubble count when positions change
  React.useEffect(() => {
    onBubbleCountChange(bubblePositions.length);
  }, [bubblePositions.length, onBubbleCountChange]);

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '18px'
      }}>
        Loading feedback data...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Network lines connecting bubbles */}
      <NetworkLines bubblePositions={bubblePositions} />
      
      {/* Render all profile bubbles */}
      {bubblePositions.map((position, index) => {
        const isCentral = index === 0; // Index 0 is the center bubble
        
        // Dynamic sizing based on screen size and position - larger to fit profile + feedback
        let size: number;
        if (isCentral) {
          // Central bubble scales with screen size - larger to accommodate content
          const screenSizeMultiplier = Math.min(containerSize.width / 1000, 1.8);
          size = Math.floor(250 * screenSizeMultiplier); // Increased from 200
        } else {
          // Regular bubbles need to be larger to fit profile pic + feedback
          const baseSize = Math.min(containerSize.width / 20, 90); // Increased from /30 and 65
          const sizeVariation = Math.random() * 20 - 10; // ±10px variation
          size = Math.max(Math.floor(baseSize + sizeVariation), 70); // Minimum 70px (increased from 35)
        }
        
        // Only use real feedback data - no fallbacks
        const data = feedbackData[index];
        const name = data.name;
        const feedback = data.feedback;
        // Use real profile image if available, otherwise generate avatar from name
        const photoUrl = data.profileImageUrl || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&size=400`;
        
        return (
          <ProfileBubble
            key={index}
            position={{
              x: position.x - size / 2, // Center the bubble on the position
              y: position.y - size / 2,
            }}
            photoUrl={photoUrl}
            size={size}
            isCentral={isCentral}
            index={index}
            name={name}
            feedback={feedback}
          />
        );
      })}
    </div>
  );
};

const View: React.FC = () => {
  const [bubbleCount, setBubbleCount] = useState(0);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load feedback data from API with auto-refresh every 30 seconds
  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        const data = await fetchFeedbackData();
        setFeedbackData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load feedback data:', error);
        setIsLoading(false);
      }
    };

    // Load data immediately
    loadFeedbackData();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadFeedbackData();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
      `}</style>
      
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        
        <ProfileGallery 
          onBubbleCountChange={setBubbleCount} 
          feedbackData={feedbackData}
          isLoading={isLoading}
        />
        
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: '#fff',
          fontSize: '14px',
          zIndex: 2000,
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          Hover over profiles to interact • {feedbackData.length} feedback entries • Auto-refreshes every 30s
        </div>
      </div>
    </>
  );
};

export default View;