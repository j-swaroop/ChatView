<template>
  <div 
    class="tooltip-wrapper"
    ref="triggerRef"
  >
    <div 
      class="trigger-container"
      ref="triggerEl"
      @click="handleTriggerClick"
      @mouseenter="props.trigger === 'hover' ? handleMouseEnter() : null"
      @mouseleave="props.trigger === 'hover' ? handleMouseLeave() : null"
      @focusin="props.trigger === 'focus' ? handleFocus($event) : null"
      @focusout="props.trigger === 'focus' ? handleBlur($event) : null"
    >
      <slot></slot>
    </div>
    
    <!-- Tooltip using Teleport for better positioning -->
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="isVisible"
          ref="tooltipRef"
          :class="[
            'tooltip',
            `tooltip-${actualPosition}`,
            { 'tooltip-no-arrow': !showArrow },
            customClass
          ]"
          :style="tooltipStyle"
        >
          <div class="tooltip-content">
            <slot name="tooltip">
              {{ content }}
            </slot>
          </div>
          
          <!-- Arrow -->
          <div 
            v-if="showArrow" 
            class="tooltip-arrow"
            :style="arrowPosition"
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  trigger: {
    type: String,
    default: 'hover',
    validator: (value) => ['hover', 'click', 'focus'].includes(value)
  },
  showArrow: {
    type: Boolean,
    default: true
  },
  offset: {
    type: Number,
    default: 8
  },
  delay: {
    type: Number,
    default: 300
  },
  hideDelay: {
    type: Number,
    default: 100
  },
  customClass: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['show', 'hide', 'toggle'])

// Refs
const triggerRef = ref(null)
const tooltipRef = ref(null)
const triggerEl = ref(null)

// Local state
const isVisible = ref(false)
const showTimeout = ref(null)
const hideTimeout = ref(null)
const tooltipPosition = ref({ top: '0px', left: '0px' })
const actualPosition = ref(props.position)
const arrowPosition = ref({})

// Collision detection helpers
const getViewportBounds = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollTop: window.pageYOffset || document.documentElement.scrollTop,
    scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
  }
}

const detectCollisions = (position, tooltipRect) => {
  const viewport = getViewportBounds()
  const buffer = 16 // 1rem buffer
  
  return {
    top: position.top < viewport.scrollTop + buffer,
    bottom: position.top + tooltipRect.height > viewport.scrollTop + viewport.height - buffer,
    left: position.left < viewport.scrollLeft + buffer,
    right: position.left + tooltipRect.width > viewport.scrollLeft + viewport.width - buffer,
  }
}

const getFlippedPosition = (position, collisions) => {
  // Flip vertically
  if ((position === 'top' || position.includes('top')) && collisions.top && !collisions.bottom) {
    return position.replace('top', 'bottom')
  }
  if ((position === 'bottom' || position.includes('bottom')) && collisions.bottom && !collisions.top) {
    return position.replace('bottom', 'top')
  }
  
  // Flip horizontally  
  if (position === 'left' && collisions.left && !collisions.right) {
    return 'right'
  }
  if (position === 'right' && collisions.right && !collisions.left) {
    return 'left'
  }
  
  return position
}

const calculatePosition = () => {
  if (!triggerEl.value || !tooltipRef.value) {
    return { top: '0px', left: '0px' }
  }

  const triggerRect = triggerEl.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewport = getViewportBounds()
  
  // Calculate initial position
  let position = calculateInitialPosition(triggerRect, tooltipRect, props.position, viewport)
  
  // Detect collisions
  const collisions = detectCollisions(position, tooltipRect)
  
  // Get flipped position if needed
  const flippedPosition = getFlippedPosition(props.position, collisions)
  actualPosition.value = flippedPosition
  
  // Recalculate with flipped position if it changed
  if (flippedPosition !== props.position) {
    position = calculateInitialPosition(triggerRect, tooltipRect, flippedPosition, viewport)
  }
  
  // Final adjustments to keep within viewport
  position = adjustForViewportBounds(position, tooltipRect, viewport)

  return {
    top: `${position.top}px`,
    left: `${position.left}px`
  }
}

const calculateInitialPosition = (triggerRect, tooltipRect, position, viewport) => {
  let top, left
  const offset = props.offset

  switch (position) {
    case 'top':
      top = triggerRect.top + viewport.scrollTop - tooltipRect.height - offset
      left = triggerRect.left + viewport.scrollLeft + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + viewport.scrollTop + offset
      left = triggerRect.left + viewport.scrollLeft + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + viewport.scrollTop + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left + viewport.scrollLeft - tooltipRect.width - offset
      break
    case 'right':
      top = triggerRect.top + viewport.scrollTop + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + viewport.scrollLeft + offset
      break
    case 'top-left':
      top = triggerRect.top + viewport.scrollTop - tooltipRect.height - offset
      left = triggerRect.left + viewport.scrollLeft
      break
    case 'top-right':
      top = triggerRect.top + viewport.scrollTop - tooltipRect.height - offset
      left = triggerRect.right + viewport.scrollLeft - tooltipRect.width
      break
    case 'bottom-left':
      top = triggerRect.bottom + viewport.scrollTop + offset
      left = triggerRect.left + viewport.scrollLeft
      break
    case 'bottom-right':
      top = triggerRect.bottom + viewport.scrollTop + offset
      left = triggerRect.right + viewport.scrollLeft - tooltipRect.width
      break
  }

  return { top, left }
}

const adjustForViewportBounds = (position, tooltipRect, viewport) => {
  let { top, left } = position
  const buffer = 16 // 1rem buffer
  
  // Adjust horizontal position
  if (left < viewport.scrollLeft + buffer) {
    left = viewport.scrollLeft + buffer
  } else if (left + tooltipRect.width > viewport.scrollLeft + viewport.width - buffer) {
    left = viewport.scrollLeft + viewport.width - tooltipRect.width - buffer
  }
  
  // Adjust vertical position
  if (top < viewport.scrollTop + buffer) {
    top = viewport.scrollTop + buffer
  } else if (top + tooltipRect.height > viewport.scrollTop + viewport.height - buffer) {
    top = viewport.scrollTop + viewport.height - tooltipRect.height - buffer
  }
  
  return { top, left }
}

const calculateArrowPosition = (triggerRect, tooltipRect, actualPos, viewport) => {
  const arrowOffset = 12 // Distance from tooltip edge
  let arrowStyle = {}
  
  // Calculate where the arrow should point relative to trigger center
  const triggerCenterX = triggerRect.left + triggerRect.width / 2
  const triggerCenterY = triggerRect.top + triggerRect.height / 2
  const tooltipLeft = parseFloat(tooltipPosition.value.left.replace('px', ''))
  const tooltipTop = parseFloat(tooltipPosition.value.top.replace('px', ''))
  
  if (actualPos.includes('top') || actualPos.includes('bottom')) {
    // For top/bottom positions, arrow should point to trigger center horizontally
    const arrowLeft = triggerCenterX - tooltipLeft
    const maxArrowLeft = tooltipRect.width - arrowOffset
    const minArrowLeft = arrowOffset
    
    arrowStyle.left = `${Math.max(minArrowLeft, Math.min(maxArrowLeft, arrowLeft))}px`
    arrowStyle.transform = 'translateX(-50%)'
  } else if (actualPos.includes('left') || actualPos.includes('right')) {
    // For left/right positions, arrow should point to trigger center vertically
    const arrowTop = triggerCenterY - tooltipTop
    const maxArrowTop = tooltipRect.height - arrowOffset
    const minArrowTop = arrowOffset
    
    arrowStyle.top = `${Math.max(minArrowTop, Math.min(maxArrowTop, arrowTop))}px`
    arrowStyle.transform = 'translateY(-50%)'
  }
  
  return arrowStyle
}

const updatePosition = () => {
  if (tooltipRef.value && isVisible.value && triggerEl.value) {
    const newPosition = calculatePosition()
    tooltipPosition.value = newPosition
    
    // Update arrow position after tooltip position is set
    nextTick(() => {
      if (tooltipRef.value && triggerEl.value) {
        const triggerRect = triggerEl.value.getBoundingClientRect()
        const tooltipRect = tooltipRef.value.getBoundingClientRect()
        const viewport = getViewportBounds()
        arrowPosition.value = calculateArrowPosition(triggerRect, tooltipRect, actualPosition.value, viewport)
      }
    })
  }
}

// Methods
const show = () => {
  if (props.disabled) return
  
  clearTimeout(hideTimeout.value)
  
  if (props.delay > 0) {
    showTimeout.value = setTimeout(() => {
      isVisible.value = true
      emit('show')
      nextTick(() => {
        updatePosition()
      })
    }, props.delay)
  } else {
    isVisible.value = true
    emit('show')
    nextTick(() => {
      updatePosition()
    })
  }
}

const hide = () => {
  clearTimeout(showTimeout.value)
  
  if (props.hideDelay > 0) {
    hideTimeout.value = setTimeout(() => {
      isVisible.value = false
      emit('hide')
    }, props.hideDelay)
  } else {
    isVisible.value = false
    emit('hide')
  }
}

const toggle = () => {
  if (isVisible.value) {
    hide()
  } else {
    show()
  }
  emit('toggle', isVisible.value)
}

// Event handlers
const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    show()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide()
  }
}

const handleTriggerClick = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (props.trigger === 'click') {
    toggle()
  }
}

const handleFocus = (event) => {
  if (props.trigger === 'focus') {
    // Check if the focused element is an input, textarea, select, or has tabindex
    const focusableElements = ['input', 'textarea', 'select', 'button']
    const target = event.target
    
    if (focusableElements.includes(target.tagName.toLowerCase()) || 
        target.hasAttribute('tabindex') || 
        target.contentEditable === 'true') {
      show()
    }
  }
}

const handleBlur = (event) => {
  if (props.trigger === 'focus') {
    hide()
  }
}

// Computed tooltip positioning
const tooltipStyle = computed(() => {
  return {
    position: 'absolute',
    top: tooltipPosition.value.top,
    left: tooltipPosition.value.left,
    zIndex: 1000,
    visibility: isVisible.value ? 'visible' : 'hidden',
  }
})

// Event handlers for resize and scroll
const handleResize = () => {
  if (isVisible.value) {
    updatePosition()
  }
}

const handleScroll = () => {
  if (isVisible.value) {
    updatePosition()
  }
}

// Cleanup on unmount
onUnmounted(() => {
  clearTimeout(showTimeout.value)
  clearTimeout(hideTimeout.value)
})

// Handle click outside for click trigger
const handleClickOutside = (event) => {
  if (props.trigger === 'click' && isVisible.value) {
    if (triggerRef.value && !triggerRef.value.contains(event.target) && 
        tooltipRef.value && !tooltipRef.value.contains(event.target)) {
      hide()
    }
  }
}

onMounted(() => {
  if (props.trigger === 'click') {
    document.addEventListener('click', handleClickOutside)
  }
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  if (props.trigger === 'click') {
    document.removeEventListener('click', handleClickOutside)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
  clearTimeout(showTimeout.value)
  clearTimeout(hideTimeout.value)
})

// Expose methods for programmatic control
defineExpose({
  show,
  hide,
  toggle,
  isVisible: computed(() => isVisible.value)
})
</script>


<style scoped lang="scss">
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  background: #1f2937;
  color: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  pointer-events: none;

  border-radius: 6px;
  border: 1px solid var(--gray-100, #F3F4F6);
  background: var(--white, #FFF);

  /* /shadow/lg */
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: inline-flex;
  // height: 31px;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;

  display: flex;
  padding: .25rem 0px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  
  .tooltip-content {
    position: relative;
    z-index: 1;
    
    display: flex;
    padding: 0 .5rem;
    align-items: center;
    gap: .25rem;
    color: var(--gray-500, #6B7280);
    font-size: .75rem;
  }
  
  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }
}

// Position-specific arrow styles with dynamic positioning
.tooltip-top .tooltip-arrow {
  top: 100%;
  border-width: 6px 6px 0 6px;
  border-color: #1f2937 transparent transparent transparent;
}

.tooltip-bottom .tooltip-arrow {
  bottom: 100%;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #1f2937 transparent;
}

.tooltip-left .tooltip-arrow {
  left: 100%;
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent #1f2937;
}

.tooltip-right .tooltip-arrow {
  right: 100%;
  border-width: 6px 6px 6px 0;
  border-color: transparent #1f2937 transparent transparent;
}

.tooltip-top-left .tooltip-arrow,
.tooltip-top-right .tooltip-arrow {
  top: 100%;
  border-width: 6px 6px 0 6px;
  border-color: #1f2937 transparent transparent transparent;
}

.tooltip-bottom-left .tooltip-arrow,
.tooltip-bottom-right .tooltip-arrow {
  bottom: 100%;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #1f2937 transparent;
}

// No arrow variant
.tooltip-no-arrow .tooltip-arrow {
  display: none;
}

// Smooth transition animations
.tooltip-fade-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.tooltip-fade-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// Theme variants with proper arrow colors
.tooltip.tooltip-light {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  
  &.tooltip-top .tooltip-arrow {
    border-top-color: white;
  }
  &.tooltip-bottom .tooltip-arrow {
    border-bottom-color: white;
  }
  &.tooltip-left .tooltip-arrow {
    border-left-color: white;
  }
  &.tooltip-right .tooltip-arrow {
    border-right-color: white;
  }
}

// Success, error, warning variants with proper arrow colors
.tooltip.tooltip-success {
  background: #10b981;
  
  &.tooltip-top .tooltip-arrow,
  &.tooltip-top-left .tooltip-arrow,
  &.tooltip-top-right .tooltip-arrow {
    border-top-color: #10b981;
  }
  &.tooltip-bottom .tooltip-arrow,
  &.tooltip-bottom-left .tooltip-arrow,
  &.tooltip-bottom-right .tooltip-arrow {
    border-bottom-color: #10b981;
  }
  &.tooltip-left .tooltip-arrow {
    border-left-color: #10b981;
  }
  &.tooltip-right .tooltip-arrow {
    border-right-color: #10b981;
  }
}

.tooltip.tooltip-error {
  background: #ef4444;
  
  &.tooltip-top .tooltip-arrow,
  &.tooltip-top-left .tooltip-arrow,
  &.tooltip-top-right .tooltip-arrow {
    border-top-color: #ef4444;
  }
  &.tooltip-bottom .tooltip-arrow,
  &.tooltip-bottom-left .tooltip-arrow,
  &.tooltip-bottom-right .tooltip-arrow {
    border-bottom-color: #ef4444;
  }
  &.tooltip-left .tooltip-arrow {
    border-left-color: #ef4444;
  }
  &.tooltip-right .tooltip-arrow {
    border-right-color: #ef4444;
  }
}

.tooltip.tooltip-warning {
  background: #f59e0b;
  
  &.tooltip-top .tooltip-arrow,
  &.tooltip-top-left .tooltip-arrow,
  &.tooltip-top-right .tooltip-arrow {
    border-top-color: #f59e0b;
  }
  &.tooltip-bottom .tooltip-arrow,
  &.tooltip-bottom-left .tooltip-arrow,
  &.tooltip-bottom-right .tooltip-arrow {
    border-bottom-color: #f59e0b;
  }
  &.tooltip-left .tooltip-arrow {
    border-left-color: #f59e0b;
  }
  &.tooltip-right .tooltip-arrow {
    border-right-color: #f59e0b;
  }
}

.trigger-container{
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>