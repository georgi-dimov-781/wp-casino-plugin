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
        add_action( 'init', array( 'Casino_Finder_Shortcode', 'init' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
        add_filter( 'script_loader_tag', array( $this, 'add_defer_attribute' ), 10, 2 );
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

        $suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

        wp_enqueue_script(
            'casino-finder',
            CF_URL . 'assets/js/casino-finder' . $suffix . '.js',
            array(),
            CF_VERSION,
            true
        );

        $config_json = wp_json_encode( Casino_Finder_Data::get_config() );
        wp_add_inline_script(
            'casino-finder',
            'window.casinoFinderConfig = ' . $config_json . ';',
            'before'
        );
    }

    /**
     * Add defer attribute to the plugin script tag.
     */
    public function add_defer_attribute( $tag, $handle ) {
        if ( 'casino-finder' !== $handle ) {
            return $tag;
        }
        return str_replace( ' src', ' defer src', $tag );
    }
}
