import type { LiquidEtherProps } from './LiquidEther';

// 修改為櫻花粉色系的配置
export const liquidEtherConfig: LiquidEtherProps = {
colors: ['#FF9EAA', '#FFC5D0', '#FFF0F5', '#FFB7C5'], // 粉色、淺粉、白粉、桃粉
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