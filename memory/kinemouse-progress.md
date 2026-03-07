# KineMouse Commit Progress

## Status: 35/? commits done — paused, resume tomorrow

## Repo
- URL: https://github.com/4shil/kinemouse
- Local: /home/ashil/kinemouse
- Branch: main

## Target: 24 more commits (from the plan we agreed on)

## Already done today (35 total commits on remote):
1. README
2. requirements.txt
3. package init
4. math_utils
5. config.py
6. hand_tracker.py
7. events.py
8. gesture_fsm.py
9. backends/__init__.py
10. base_backend.py
11. linux_x11_backend.py
12. linux_wayland_backend.py
13. windows + macos backends
14. main.py
15. tests (math_utils + events)
16. tests (gesture_fsm)
17. setup.py + .gitignore
18. docs/ (ARCHITECTURE + SETUP)
19. permissions.py
20. CHANGELOG + CONTRIBUTING
21. README rewrite (pro style, badges, no emoji)
22. centralized logger
23. constants module
24. examples/run_demo.py
25. fps_counter.py
26. FrameAnnotator HUD
27. scroll_gesture.py (ring+thumb)
28. ScrollMixin + X11 scroll
29. gesture_classifier.py (fist/peace/thumbs up)
30. screen_info.py (cross-platform)
31. calibration.py (4-corner wizard)
32. GitHub Actions CI (tests + lint)
33. ProfileMonitor (per-frame cpu/mem/fps)
34. hotkey_listener.py (pause/quit/calibrate/debug)
35. config persistence (save/load JSON)
36. MultiHandTracker

## Remaining planned commits (target 24 more = steps 13–34 from plan):
- GestureConfig hot-reload from JSON
- MultiMonitorRouter
- Wayland scroll (uinput REL_WHEEL)
- macOS scroll (Quartz CGEvent)
- Windows scroll (pynput)
- examples/calibrate.py
- kinemouse/cli.py
- kinemouse/runner.py
- Integrate scroll + pose into runner
- Integrate calibration into runner (--calibrate flag)
- Integrate ScreenInfo into backends
- Integrate FPS + FrameAnnotator into runner
- tests/test_fps_counter.py
- tests/test_scroll_gesture.py
- tests/test_gesture_classifier.py
- tests/test_screen_info.py
- tests/test_calibration.py
- examples/record_session.py
- tools/replay_session.py
- pyproject.toml
- pre-commit-config.yaml
- README — CI badge + update

## Notes
- Commit msg style: short, human, no tags (feat:/chore: etc not wanted by user)
- No backdating — real timestamps
- Push after every single commit
- User wants max features, professional quality
- No GIF demo (user said skip)
