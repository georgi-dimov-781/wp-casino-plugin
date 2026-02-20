<?php
/**
 * Main Casino Finder plugin class.
 */
class Casino_Finder {

    /**
     * Singleton instance.
     */
    private static $instance = null;

    /**
     * Get singleton instance.
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor — use get_instance().
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Register WordPress hooks.
     */
    private function init_hooks() {
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    /**
     * Enqueue CSS and JS only on pages that use the shortcode.
     */
    public function enqueue_assets() {
        global $post;

        if ( ! is_a( $post, 'WP_Post' ) || ! has_shortcode( $post->post_content, 'casino_finder' ) ) {
            return;
        }

        wp_enqueue_style(
            'casino-finder',
            CF_URL . 'assets/css/casino-finder.css',
            array(),
            CF_VERSION
        );

        wp_enqueue_script(
            'casino-finder',
            CF_URL . 'assets/js/casino-finder.js',
            array(),
            CF_VERSION,
            true
        );
    }
}
