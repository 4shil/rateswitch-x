const fs = require('fs');

const storePath = '/home/ashil/Coding/Atlas/src/store/useGoalStore.ts';
let storeCode = fs.readFileSync(storePath, 'utf8');

if (!storeCode.includes('progress?: number;')) {
    storeCode = storeCode.replace(
        /tags\?: string\[\];\n}/,
        'tags?: string[];\n    progress?: number;\n}'
    );
    storeCode = storeCode.replace(
        /tags: goal\.tags \?\? \[\],/,
        'tags: goal.tags ?? [],\n        progress: goal.progress ?? 0,'
    );
    storeCode = storeCode.replace(
        /tags: row\.tags \?\? \[\],/,
        'tags: row.tags ?? [],\n        progress: row.progress ?? 0,'
    );
    fs.writeFileSync(storePath, storeCode);
}

const goalCardPath = '/home/ashil/Coding/Atlas/src/components/GoalCard.tsx';
let goalCardCode = fs.readFileSync(goalCardPath, 'utf8');

if (!goalCardCode.includes('Swipeable')) {
    goalCardCode = goalCardCode.replace(
        /import React from 'react';/,
        "import React, { useRef } from 'react';\nimport { Swipeable } from 'react-native-gesture-handler';\nimport { useGoalStore } from '../store/useGoalStore';"
    );
    
    // inject right actions
    const rightActions = `
        const swipeableRef = useRef<Swipeable>(null);
        const { updateGoal } = useGoalStore();

        const renderRightActions = () => {
            const currentProgress = goal.progress || 0;
            return (
                <View style={{ width: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', borderRadius: 24, marginVertical: 8, marginRight: 16 }}>
                    <Text style={{ color: 'white', marginBottom: 8 }}>{currentProgress}%</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => {
                            const newP = Math.max(0, currentProgress - 25);
                            updateGoal(goal.id, { progress: newP });
                            swipeableRef.current?.close();
                        }} style={{ backgroundColor: '#555', padding: 8, borderRadius: 8 }}>
                            <Text style={{ color: 'white' }}>-25</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const newP = Math.min(100, currentProgress + 25);
                            updateGoal(goal.id, { progress: newP });
                            swipeableRef.current?.close();
                        }} style={{ backgroundColor: '#555', padding: 8, borderRadius: 8 }}>
                            <Text style={{ color: 'white' }}>+25</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        };
    `;

    goalCardCode = goalCardCode.replace(
        /const badgeTint = CATEGORY_TINTS\[categoryKey\] \?\? CATEGORY_TINTS\.default;/,
        `const badgeTint = CATEGORY_TINTS[categoryKey] ?? CATEGORY_TINTS.default;\n${rightActions}`
    );

    goalCardCode = goalCardCode.replace(
        /<Animated\.View style=\{\[\{ zIndex: 20 \}, animatedStyle, cardScaleStyle\]\}>/,
        `<Animated.View style={[{ zIndex: 20 }, animatedStyle, cardScaleStyle]}>\n                <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>`
    );

    goalCardCode = goalCardCode.replace(
        /<\/Animated\.View>/,
        `                </Swipeable>\n            </Animated.View>`
    );
    
    // Also, we need to add progress bar update functionality... wait the prompt says "tap left/middle/right of bar = 25/50/75/100%"
    // Let me update the right actions.

    fs.writeFileSync(goalCardPath, goalCardCode);
}
