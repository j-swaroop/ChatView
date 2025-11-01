<template>
  <div class="rotation-container">
    <div class="rotation-element">
      <svg xmlns="http://www.w3.org/2000/svg" width="261" height="260" viewBox="0 0 261 260" fill="none">
        <g clip-path="url(#clip0_94_19506)">
          <!-- Outer ring rotating counter-clockwise -->
          <g>
            <path
              class="outer-ring"
              d="M130.501 2.70819C200.802 2.70819 257.793 59.6989 257.793 130C257.793 200.301 200.802 257.292 130.501 257.292C60.1997 257.292 3.20892 200.301 3.20892 130C3.20892 59.6989 60.1997 2.70819 130.501 2.70819Z"
              :fill="backgroundColor"
              stroke="url(#paint0_linear_94_19506)"
              stroke-width="5.41667"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 130.5 130"
                to="360 130.5 130"
                :dur="duration * 2 + 's'"
                repeatCount="indefinite"
              />
            </path>
          </g>

          <!-- Inner group rotates clockwise -->
          <g>
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 130.5 130"
              to="-360 130.5 130"
              :dur="duration + 's'"
              repeatCount="indefinite"
            />

            <g filter="url(#filter0_f_94_19506)">
              <path
                class="inner-shape-1"
                d="M195.797 85.2425C186.221 88.18 93.9214 82.9815 94.6708 178.168C92.2749 170.357 20.0499 119.557 36.4945 103.107C47.5966 79.7433 92.6313 58.7895 101.611 55.5486C155.614 31.0679 205.373 82.3051 195.797 85.2425Z"
              />
            </g>
            <g filter="url(#filter1_f_94_19506)">
              <path
                class="inner-shape-2"
                d="M56.5576 180.129C67.8206 177.112 177.165 195.144 174.059 61.2148C177.076 72.4755 237.494 127.848 218.418 149.068C205.825 180.63 183.219 205.376 172.668 208.89C109.335 237.039 45.2947 183.147 56.5576 180.129Z"
                :fill="primaryColor"
              >
                <animate
                  attributeName="fill"
                  :values="`${secondaryColor};${primaryColor};${secondaryColor}`"
                  :dur="duration + 's'"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_94_19506"
            x="-30.9382"
            y="-16.0563"
            width="292.925"
            height="259.224"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="32.5" result="effect1_foregroundBlur_94_19506" />
          </filter>
          <filter
            id="filter1_f_94_19506"
            x="-9.73956"
            y="-3.78519"
            width="296.874"
            height="285.789"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="32.5" result="effect1_foregroundBlur_94_19506" />
          </filter>
          <linearGradient
            id="paint0_linear_94_19506"
            x1="130.501"
            y1="0.000185043"
            x2="195.501"
            y2="243.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="white" stop-opacity="0" />
            <stop :stop-color="primaryColor" offset="1" />
          </linearGradient>
          <clipPath id="clip0_94_19506">
            <rect width="260" height="260" fill="white" transform="translate(0.5)" />
          </clipPath>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  duration: {
    type: Number,
    default: 3,
  },
  primaryColor: {
    type: String,
    default: '#c8d5f7',
  },
  secondaryColor: {
    type: String,
    default: '#C6D3F7',
  },
  backgroundColor: {
    type: String,
    default: '#F1F4FD',
  },
});
</script>

<style scoped>
.rotation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* padding: 2rem; */
}

.rotation-element {
  width: 3rem;
  height: 3rem;
}

.rotation-element svg {
  width: 100%;
  height: 100%;
}

.inner-shape-1 {
  fill: white;
}
</style>
