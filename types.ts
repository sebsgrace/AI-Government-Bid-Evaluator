
export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  location: string;
}

export interface Bidder {
  id: string;
  name: string;
  amount: number | string;
  inclusions: string;
}

export interface BACMember {
  id: string;
  name: string;
  designation: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}
