import { ReactNode } from 'react'
import { useSubscriptionStore } from '../store/subscriptionStore'
import UpgradePrompt from './UpgradePrompt'

type Feature =
  | 'regenerate'
  | 'export_pdf'
  | 'advanced_diets'
  | 'extended_days'
  | 'custom_macros'
  | 'smart_pricing'
  | 'unlimited_plans'

interface FeatureGateProps {
  feature: Feature
  children: ReactNode
  fallback?: ReactNode
  showPrompt?: boolean
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  showPrompt = true,
}: FeatureGateProps) {
  const { plan, isFirstPlan } = useSubscriptionStore()

  // Pro users and first-plan users have access to most features
  const hasAccess = checkFeatureAccess(feature, plan, isFirstPlan)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showPrompt) {
    return <UpgradePrompt feature={feature} inline />
  }

  return null
}

function checkFeatureAccess(
  feature: Feature,
  plan: 'free' | 'pro',
  isFirstPlan: boolean
): boolean {
  // Pro users have access to everything
  if (plan === 'pro') return true

  // First-plan users get pro-tier features for their first plan
  if (isFirstPlan) {
    // Most features are available during first-plan-free
    const firstPlanFeatures: Feature[] = [
      'advanced_diets',
      'extended_days',
      'custom_macros',
      'smart_pricing',
      'export_pdf',
    ]
    return firstPlanFeatures.includes(feature)
  }

  // Free tier users have no access to pro features
  return false
}

// Hook for checking feature access programmatically
export function useFeatureAccess(feature: Feature): boolean {
  const { plan, isFirstPlan } = useSubscriptionStore()
  return checkFeatureAccess(feature, plan, isFirstPlan)
}

// Hook for getting user limits
export function useUserLimits() {
  const { plan, isFirstPlan, maxDays, plansLimit, canCreatePlan } =
    useSubscriptionStore()

  return {
    plan,
    isFirstPlan,
    maxDays,
    plansLimit,
    canCreatePlan,
    isPro: plan === 'pro',
    hasProAccess: plan === 'pro' || isFirstPlan,
  }
}
