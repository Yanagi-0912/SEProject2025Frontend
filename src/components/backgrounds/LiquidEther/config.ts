import type { LiquidEtherProps } from './LiquidEther';

// LiquidEther 背景特效的配置
export const liquidEtherConfig: LiquidEtherProps = {
  colors: ['#5227FF', '#FF9FFC', '#B19EEF'],
  mouseForce: 20,
  cursorSize: 100,
  isViscous: false,
  viscous: 30,
  iterationsViscous: 32,
  iterationsPoisson: 32,
  resolution: 0.5,
  isBounce: false,
  autoDemo: true,
  autoSpeed: 0.5,
  autoIntensity: 2.2,
  takeoverDuration: 0.25,
  autoResumeDelay: 3000,
  autoRampDuration: 0.6,
};

