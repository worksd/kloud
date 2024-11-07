interface Window {
  /**
   * Navigation
   */
  navigateOnboard: () => void;
  navigateLogin: () => void;
  navigateLessonDetail: (lessonId: number) => void;
  navigateStudioDetail: (studioId: number) => void;
  onBackPressed: () => void;



}