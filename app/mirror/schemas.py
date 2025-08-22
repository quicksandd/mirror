from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from openai.types.shared_params.response_format_json_schema import JSONSchema


class ApiSchema(BaseModel):
    """Base schema class for OpenAI structured output"""

    class Config:
        json_schema_extra = {
            "additionalProperties": False,
        }

    @classmethod
    def json_schema(cls) -> JSONSchema:
        return JSONSchema(
            name=cls.__name__,
            schema=cls.model_json_schema(),
            strict=True,
        )


class TimelinePeriodSchema(ApiSchema):
    """Schema for individual timeline period analysis"""

    period_name: str = Field(description="Name of the time period (e.g., 'Ранний период', 'Недавний период')")
    start_date: str = Field(description="Start date of this period in YYYY-MM-DD format")
    end_date: str = Field(description="End date of this period in YYYY-MM-DD format")
    personality_during_period: str = Field(
        description="Detailed analysis of their personality and behavior during this specific time period, with specific examples and evidence"
    )
    key_events: List[str] = Field(
        description="3-5 key events or patterns that characterized this period, with specific examples"
    )
    emotional_state: str = Field(
        description="Their emotional landscape during this period, with evidence from their communication"
    )
    communication_patterns: List[str] = Field(
        description="3-4 specific communication patterns that emerged during this period, with examples"
    )
    growth_or_regression: str = Field(
        description="Whether they showed growth, regression, or stability during this period, with specific evidence"
    )
    emotional_triggers: List[str] = Field(
        description="3-5 emotional triggers or sensitive topics that set them off during this period, with specific situations and evidence"
    )
    coping_mechanisms: List[str] = Field(
        description="Current coping strategies during this period - both the healthy and the not-so-healthy ones, with detailed examples"
    )
    therapy_goals: List[str] = Field(
        description="3-4 specific therapy goals based on their patterns and needs during this period, with clear reasoning"
    )
    growth_areas: List[str] = Field(
        description="Areas where they need to grow during this period - be honest but compassionate, with specific examples"
    )


class MirrorAnalysisSchema(ApiSchema):
    """Schema for mirror analysis response - insightful and bold personality analysis with abundant examples"""

    personality: str = Field(
        description="A comprehensive and bold personality analysis that cuts through the surface, with specific examples and evidence from their communication"
    )
    communication_style: str = Field(
        description="Detailed analysis of how they communicate - their unique voice, patterns, and what it reveals, with actual quotes and examples"
    )
    emotional_state: str = Field(
        description="Current emotional landscape - what's really going on beneath the surface, with evidence from their words and behavior"
    )
    relationship_patterns: str = Field(
        description="How they relate to others - their dance of connection and disconnection, with specific interaction examples"
    )

    # List fields - all required for OpenAI strict mode
    main_patterns: List[str] = Field(
        description="3-5 core behavioral patterns that define their way of being, with specific examples and evidence"
    )
    personality_traits: List[str] = Field(
        description="5-7 key personality traits - the good, the challenging, and the surprising, with concrete examples"
    )
    emotional_triggers: List[str] = Field(
        description="3-5 emotional triggers or sensitive topics that set them off, with specific situations and evidence"
    )
    coping_mechanisms: List[str] = Field(
        description="Current coping strategies - both the healthy and the not-so-healthy ones, with detailed examples"
    )
    therapy_goals: List[str] = Field(
        description="3-4 specific therapy goals based on their patterns and needs, with clear reasoning"
    )
    growth_areas: List[str] = Field(
        description="Areas where they need to grow - be honest but compassionate, with specific examples"
    )
    recommendations: List[str] = Field(
        description="Practical, actionable recommendations for personal development, with step-by-step guidance"
    )
    communication_examples: List[str] = Field(
        description="5 realistic dialogue examples that capture their authentic voice, with context and reasoning"
    )
    actual_chat_examples: List[str] = Field(
        description="List of actual conversation examples from the chat data (up to 20 examples) with analysis"
    )
    self_reflection_questions: List[str] = Field(
        description="Provocative questions for deep self-reflection, with explanations of why these questions matter"
    )


class TimelineAnalysisSchema(ApiSchema):
    """Schema for timeline analysis that combines multiple period analyses"""

    # Core psychological profile (current state)
    main_characteristics: str = Field(
        description="The core, consistent characteristics that define who they are across all time periods"
    )
    communication_style: str = Field(
        description="Detailed analysis of how they communicate - their unique voice, patterns, and what it reveals, with actual quotes and examples from across all periods"
    )
    emotional_state: str = Field(
        description="Current emotional landscape - what's really going on beneath the surface, with evidence from their words and behavior across all periods"
    )
    relationship_patterns: str = Field(
        description="How they relate to others - their dance of connection and disconnection, with specific interaction examples from across all periods"
    )
    main_patterns: List[str] = Field(
        description="3-5 core behavioral patterns that define their way of being across all time periods, with specific examples and evidence"
    )
    personality_traits: List[str] = Field(
        description="5-7 key personality traits - the good, the challenging, and the surprising, with concrete examples from across all periods"
    )
    emotional_triggers: List[str] = Field(
        description="3-5 emotional triggers or sensitive topics that set them off, with specific situations and evidence from across all periods"
    )
    coping_mechanisms: List[str] = Field(
        description="Current coping strategies - both the healthy and the not-so-healthy ones, with detailed examples from across all periods"
    )
    therapy_goals: List[str] = Field(
        description="3-4 specific therapy goals based on their patterns and needs, with clear reasoning"
    )
    growth_areas: List[str] = Field(
        description="Areas where they need to grow - be honest but compassionate, with specific examples"
    )
    recommendations: List[str] = Field(
        description="Practical, actionable recommendations for personal development, with step-by-step guidance"
    )

    # Evolution and timeline analysis
    overall_personality_evolution: str = Field(
        description="Comprehensive analysis of how their personality has evolved over time, with specific examples and evidence"
    )
    key_transformation_points: List[str] = Field(
        description="3-5 critical moments or periods where significant changes occurred, with detailed explanations"
    )
    timeline_periods: List[TimelinePeriodSchema] = Field(
        description="Detailed analysis of each time period, showing their personality and behavior during that specific time"
    )
    common_themes: List[str] = Field(
        description="5-7 recurring themes that appear throughout their timeline, with examples from different periods"
    )
    growth_trajectory: str = Field(
        description="Analysis of their overall growth trajectory - where they started, where they are now, and the journey in between"
    )
    future_predictions: List[str] = Field(
        description="3-4 predictions about their future development based on their patterns and growth trajectory"
    )
    timeline_insights: str = Field(
        description="Deep insights about what their timeline reveals about their true nature and potential"
    )
